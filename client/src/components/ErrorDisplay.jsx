export default function ErrorDisplay({ error, code, onFixError, loading }) {
  if (!error) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Syntax Error Detected
          </h3>
          <p className="text-red-700 dark:text-red-300 font-mono text-sm mb-4">
            {error}
          </p>

          <button
            onClick={() => onFixError(code, error)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {loading ? "Analyzing..." : "🤖 Get AI Help to Fix"}
          </button>
        </div>
      </div>
    </div>
  );
}
