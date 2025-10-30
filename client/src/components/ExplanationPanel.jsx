import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function ExplanationPanel({
  explanation,
  loading,
  onClose,
  streamingTextRef,
  streamingProviderRef,
}) {
  const textDisplayRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Update DOM directly during streaming without triggering React re-renders
  useEffect(() => {
    if (!explanation?.streaming || !textDisplayRef.current) {
      return;
    }

    const updateDisplay = () => {
      if (textDisplayRef.current && streamingTextRef.current) {
        textDisplayRef.current.textContent = streamingTextRef.current;
      }
      animationFrameRef.current = requestAnimationFrame(updateDisplay);
    };

    updateDisplay();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [explanation?.streaming, explanation?.updateKey, streamingTextRef]);

  if (!explanation && !loading) {
    return null;
  }

  // Show loading only when there's no explanation yet
  const showLoading = loading && !explanation;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          AI Explanation
        </h2>
        {onClose && !showLoading && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : explanation ? (
        <div>
          {explanation.success ? (
            <>
              <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div>
                  Provider:{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {(explanation.streaming
                      ? streamingProviderRef?.current
                      : explanation.provider) === "ollama"
                      ? "🦙 Ollama (Local)"
                      : (explanation.streaming
                          ? streamingProviderRef?.current
                          : explanation.provider) === "gemini"
                      ? "✨ Google Gemini"
                      : "⏳ Connecting..."}
                  </span>
                </div>
                {explanation.streaming && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="animate-pulse">●</div>
                    <span className="text-xs">Streaming...</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px] max-h-[600px] overflow-auto">
                {explanation.streaming ? (
                  // While streaming, update DOM directly via ref (no React re-renders)
                  <div className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono leading-relaxed">
                    <span ref={textDisplayRef}></span>
                    <span className="inline-block w-2 h-4 bg-blue-600 animate-pulse ml-1 align-middle"></span>
                  </div>
                ) : explanation.text ? (
                  // Once done, render as markdown
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-code:text-blue-600 dark:prose-code:text-blue-400">
                    <ReactMarkdown>{explanation.text}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Waiting for AI response...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              <p className="font-semibold mb-2">Error:</p>
              <p className="text-sm">{explanation.error}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
