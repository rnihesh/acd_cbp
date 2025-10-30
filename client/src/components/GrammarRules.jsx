export default function GrammarRules({
  rules,
  code,
  onExplainGrammar,
  loading,
}) {
  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Context-Free Grammar Rules
      </h2>

      <div className="space-y-2 mb-4">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm text-gray-800 dark:text-gray-200"
          >
            {rule}
          </div>
        ))}
      </div>

      <button
        onClick={() => onExplainGrammar(rules, code)}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {loading ? "Explaining..." : "🤖 Explain Grammar with AI"}
      </button>
    </div>
  );
}
