import { useState } from "react";

export default function CodeEditor({ onParse, loading }) {
  const [code, setCode] = useState("if (x < y) x = y;");

  const examples = [
    { name: "If Statement", code: "if (x < y) x = y;" },
    {
      name: "While Loop",
      code: "while (i < 10) {\n  sum = sum + i;\n  i++;\n}",
    },
    { name: "Function", code: "function add(a, b) {\n  return a + b;\n}" },
    { name: "Variable Declaration", code: "const x = 5;\nlet y = x + 3;" },
    {
      name: "For Loop",
      code: "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}",
    },
  ];

  const handleParse = () => {
    onParse(code);
  };

  const loadExample = (exampleCode) => {
    setCode(exampleCode);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Code Input
        </h2>
        <div className="flex gap-2">
          <select
            onChange={(e) => loadExample(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Load Example...</option>
            {examples.map((ex, idx) => (
              <option key={idx} value={ex.code}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-64 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        placeholder="Enter your code here..."
        spellCheck={false}
      />

      <button
        onClick={handleParse}
        disabled={loading || !code.trim()}
        className="mt-4 w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? "Parsing..." : "Parse & Visualize 🚀"}
      </button>
    </div>
  );
}
