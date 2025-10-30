import { useState, useEffect } from "react";
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

  // Check AI status on mount
  useEffect(() => {
    getAIStatus().then(setAiStatus).catch(console.error);
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
    setExplanation(null);

    try {
      const result = await explainNode(node, currentCode);
      setExplanation(result);
    } catch (err) {
      setExplanation({
        success: false,
        error: err.response?.data?.error || err.message,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleExplainGrammar = async (rules, code) => {
    setAiLoading(true);
    setExplanation(null);

    try {
      const result = await explainGrammar(rules, code);
      setExplanation(result);
    } catch (err) {
      setExplanation({
        success: false,
        error: err.response?.data?.error || err.message,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleFixError = async (code, errorMsg) => {
    setAiLoading(true);
    setExplanation(null);

    try {
      const result = await detectErrors(code, errorMsg);
      setExplanation(result);
    } catch (err) {
      setExplanation({
        success: false,
        error: err.response?.data?.error || err.message,
      });
    } finally {
      setAiLoading(false);
    }
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
