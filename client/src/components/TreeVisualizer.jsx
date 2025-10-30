import { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function TreeVisualizer({ mermaidCode, onNodeClick }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
    });
  }, []);

  useEffect(() => {
    if (mermaidCode && containerRef.current) {
      // Clear previous content
      containerRef.current.innerHTML = "";

      // Create a unique ID for this diagram
      const id = `mermaid-${Date.now()}`;

      // Render the mermaid diagram
      mermaid
        .render(id, mermaidCode)
        .then(({ svg }) => {
          containerRef.current.innerHTML = svg;

          // Add click handlers to nodes
          if (onNodeClick) {
            const nodes = containerRef.current.querySelectorAll(".node");
            nodes.forEach((node) => {
              node.style.cursor = "pointer";
              node.addEventListener("click", () => {
                const text = node.textContent;
                // Extract node type from text (format: "Type [operator]" or "Type (name)" or just "Type")
                let type = text.split(/[\[\(]/)[0].trim();

                // Extract operator if present
                const operatorMatch = text.match(/\[([^\]]+)\]/);
                const operator = operatorMatch ? operatorMatch[1] : undefined;

                // Extract name if present
                const nameMatch = text.match(/\(([^\)]+)\)/);
                const name = nameMatch ? nameMatch[1] : undefined;

                const nodeData = {
                  text,
                  type,
                  operator,
                  name,
                };

                console.log("🔍 Clicked node:", nodeData);
                onNodeClick(nodeData);
              });
            });
          }
        })
        .catch((error) => {
          // Silently handle mermaid rendering errors
          containerRef.current.innerHTML = `<div class="text-red-600 p-4">Error rendering tree: ${error.message}</div>`;
        });
    }
  }, [mermaidCode, onNodeClick]);

  if (!mermaidCode) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Syntax Tree Visualization
        </h2>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
              />
            </svg>
            <p className="text-lg">
              Parse some code to see the tree visualization
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Abstract Syntax Tree (AST)
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Click on nodes to get AI explanations
        </span>
      </div>

      <div
        ref={containerRef}
        className="mermaid-container overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
        style={{ maxHeight: "600px" }}
      />
    </div>
  );
}
