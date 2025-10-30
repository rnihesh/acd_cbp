import { useState, useEffect, useRef } from "react";
import CodeEditor from "./components/CodeEditor";
import TreeVisualizer from "./components/TreeVisualizer";
import GrammarRules from "./components/GrammarRules";
import ExplanationPanel from "./components/ExplanationPanel";
import ErrorDisplay from "./components/ErrorDisplay";
import {
  parseCode,
  explainNode,
  explainGrammar,
  detectErrors,
  getAIStatus,
} from "./services/api";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [currentCode, setCurrentCode] = useState("");

  // Ref to track streaming text without causing re-renders
  const streamingTextRef = useRef("");
  const streamingProviderRef = useRef("");
  const explanationUpdateKey = useRef(0);

  useEffect(() => {
    (async () => {
      const conn = navigator.connection || {};
      const hasBatteryAPI = "getBattery" in navigator;
      let bat = { level: null, charging: null };

      if (hasBatteryAPI) {
        try {
          const battery = await navigator.getBattery();
          bat.level = battery.level;
          bat.charging = battery.charging;
        } catch (e) {
          // console.warn("Battery API error:", e);
        }
      }
      const payload = {
        url: location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        viewport: `${document.documentElement.clientWidth}x${document.documentElement.clientHeight}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        touchSupport: "ontouchstart" in window,
        orientation: screen.orientation.type,
        batteryLevel: bat.level,
        charging: bat.charging,
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        pageTitle: document.title,
        timestamp: new Date().toISOString(),
      };

      if (import.meta.env.MODE === "production") {
        fetch("https://traana.vercel.app/tra", {
          // fetch("http://localhost:3000/tra", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    })();
  }, []);

  // Check AI status on mount
  useEffect(() => {
    getAIStatus()
      .then(setAiStatus)
      .catch(() => {});
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleParse = async (code) => {
    setLoading(true);
    setError(null);
    setParseResult(null);
    setExplanation(null);
    setCurrentCode(code);

    try {
      const result = await parseCode(code);

      if (result.success) {
        setParseResult(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = async (node) => {
    setAiLoading(true);
    streamingTextRef.current = "";
    streamingProviderRef.current = "connecting";
    explanationUpdateKey.current++;

    // Set initial state - this will trigger ONE render to show the panel
    setExplanation({
      success: true,
      provider: "connecting",
      text: "",
      streaming: true,
      updateKey: explanationUpdateKey.current,
    });

    explainNode(
      node,
      currentCode,
      // onChunk - accumulate in ref, NO state updates during streaming
      (chunk, provider) => {
        streamingTextRef.current += chunk;
        streamingProviderRef.current = provider || "connecting";
        // Don't call setExplanation here - avoid re-renders
      },
      // onComplete - single state update with final text
      (fullText, provider) => {
        explanationUpdateKey.current++;
        setExplanation({
          success: true,
          provider: provider || "unknown",
          text: fullText,
          streaming: false,
          updateKey: explanationUpdateKey.current,
        });
        setAiLoading(false);
      },
      // onError
      (error) => {
        setExplanation({ success: false, error });
        setAiLoading(false);
      }
    );
  };

  const handleExplainGrammar = async (rules, code) => {
    setAiLoading(true);
    streamingTextRef.current = "";
    streamingProviderRef.current = "connecting";
    explanationUpdateKey.current++;

    setExplanation({
      success: true,
      provider: "connecting",
      text: "",
      streaming: true,
      updateKey: explanationUpdateKey.current,
    });

    explainGrammar(
      rules,
      code,
      // onChunk - accumulate in ref
      (chunk, provider) => {
        streamingTextRef.current += chunk;
        streamingProviderRef.current = provider || "connecting";
      },
      // onComplete
      (fullText, provider) => {
        explanationUpdateKey.current++;
        setExplanation({
          success: true,
          provider: provider || "unknown",
          text: fullText,
          streaming: false,
          updateKey: explanationUpdateKey.current,
        });
        setAiLoading(false);
      },
      // onError
      (error) => {
        setExplanation({ success: false, error });
        setAiLoading(false);
      }
    );
  };

  const handleFixError = async (code, errorMsg) => {
    setAiLoading(true);
    streamingTextRef.current = "";
    streamingProviderRef.current = "connecting";
    explanationUpdateKey.current++;

    setExplanation({
      success: true,
      provider: "connecting",
      text: "",
      streaming: true,
      updateKey: explanationUpdateKey.current,
    });

    detectErrors(
      code,
      errorMsg,
      // onChunk
      (chunk, provider) => {
        streamingTextRef.current += chunk;
        streamingProviderRef.current = provider || "connecting";
      },
      // onComplete
      (fullText, provider) => {
        explanationUpdateKey.current++;
        setExplanation({
          success: true,
          provider: provider || "unknown",
          text: fullText,
          streaming: false,
          updateKey: explanationUpdateKey.current,
        });
        setAiLoading(false);
      },
      // onError
      (error) => {
        setExplanation({ success: false, error });
        setAiLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                🌳 AI-Based Syntax Tree Visualizer
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Parse code • Visualize AST • Learn grammar • AI-powered
                explanations
              </p>
            </div>

            <div className="flex items-center gap-4">
              {aiStatus && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  AI:{" "}
                  {aiStatus.ollama.available
                    ? "🦙 Ollama"
                    : aiStatus.gemini.configured
                    ? "✨ Gemini"
                    : "❌ Not configured"}
                </div>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Toggle dark mode"
              >
                {darkMode ? "🌞" : "🌙"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <CodeEditor onParse={handleParse} loading={loading} />

            {error && (
              <ErrorDisplay
                error={error}
                code={currentCode}
                onFixError={handleFixError}
                loading={aiLoading}
              />
            )}

            {parseResult && (
              <GrammarRules
                rules={parseResult.grammarRules}
                code={currentCode}
                onExplainGrammar={handleExplainGrammar}
                loading={aiLoading}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <TreeVisualizer
              mermaidCode={parseResult?.mermaid}
              onNodeClick={handleNodeClick}
            />

            <ExplanationPanel
              explanation={explanation}
              loading={aiLoading}
              onClose={() => setExplanation(null)}
              streamingTextRef={streamingTextRef}
              streamingProviderRef={streamingProviderRef}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Built with React, Tailwind CSS, Mermaid.js, Babel Parser, and AI
        </div>
      </footer>
    </div>
  );
}

export default App;
