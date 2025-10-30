const parser = require("@babel/parser");

/**
 * Parse code and generate AST
 */
function parseCode(code, language = "javascript") {
  try {
    // Parse the code into AST
    const ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: true,
    });

    return {
      success: true,
      ast: ast,
      simplified: simplifyAST(ast),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      loc: error.loc,
    };
  }
}

/**
 * Simplify AST for better visualization
 * Removes unnecessary metadata and focuses on structure
 */
function simplifyAST(node, depth = 0) {
  if (!node || typeof node !== "object") {
    return node;
  }

  // Base case: primitive values
  if (
    node.type === "Literal" ||
    node.type === "NumericLiteral" ||
    node.type === "StringLiteral" ||
    node.type === "BooleanLiteral"
  ) {
    return {
      type: node.type,
      value: node.value,
      raw: node.raw,
    };
  }

  if (node.type === "Identifier") {
    return {
      type: "Identifier",
      name: node.name,
    };
  }

  // Simplified node structure
  const simplified = {
    type: node.type,
    children: [],
  };

  // Add relevant properties based on node type
  if (node.operator) simplified.operator = node.operator;
  if (node.name) simplified.name = node.name;
  if (node.value !== undefined && !node.type.includes("Literal")) {
    simplified.value = node.value;
  }

  // Recursively process children
  for (const key in node) {
    if (
      key === "type" ||
      key === "loc" ||
      key === "start" ||
      key === "end" ||
      key === "range" ||
      key === "extra"
    ) {
      continue;
    }

    const value = node[key];

    if (Array.isArray(value)) {
      value.forEach((child) => {
        if (child && typeof child === "object" && child.type) {
          simplified.children.push({
            ...simplifyAST(child, depth + 1),
            label: key,
          });
        }
      });
    } else if (value && typeof value === "object" && value.type) {
      simplified.children.push({
        ...simplifyAST(value, depth + 1),
        label: key,
      });
    }
  }

  return simplified;
}

/**
 * Generate Mermaid syntax for tree visualization
 */
function generateMermaidTree(ast) {
  let nodeId = 0;
  const lines = ["graph TD"];

  function traverse(node, parentId = null) {
    const currentId = `node${nodeId++}`;

    // Create node label
    let label = node.type;
    if (node.operator) label += ` [${node.operator}]`;
    if (node.name) label += ` (${node.name})`;
    if (node.value !== undefined) label += `: ${JSON.stringify(node.value)}`;

    // Add node definition
    lines.push(`    ${currentId}["${label}"]`);

    // Connect to parent
    if (parentId !== null) {
      const edgeLabel = node.label ? `|${node.label}|` : "";
      lines.push(`    ${parentId} -->${edgeLabel} ${currentId}`);
    }

    // Process children
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => traverse(child, currentId));
    }

    return currentId;
  }

  // Start from the simplified AST
  if (ast.simplified) {
    traverse(ast.simplified);
  }

  return lines.join("\n");
}

/**
 * Extract grammar rules used in the code
 */
function extractGrammarRules(ast) {
  const rules = new Set();

  function traverse(node) {
    if (!node || !node.type) return;

    // Map AST node types to grammar rules
    const grammarMap = {
      IfStatement:
        "IfStatement → if ( Expression ) Statement [ else Statement ]",
      BinaryExpression: "BinaryExpression → Expression Operator Expression",
      AssignmentExpression: "AssignmentExpression → Identifier = Expression",
      ExpressionStatement: "ExpressionStatement → Expression ;",
      WhileStatement: "WhileStatement → while ( Expression ) Statement",
      ForStatement: "ForStatement → for ( Init ; Test ; Update ) Statement",
      FunctionDeclaration:
        "FunctionDeclaration → function Identifier ( Parameters ) Block",
      VariableDeclaration:
        "VariableDeclaration → (var|let|const) Identifier [ = Expression ]",
      BlockStatement: "BlockStatement → { Statements }",
      ReturnStatement: "ReturnStatement → return [ Expression ] ;",
      CallExpression: "CallExpression → Identifier ( Arguments )",
    };

    if (grammarMap[node.type]) {
      rules.add(grammarMap[node.type]);
    }

    // Traverse children
    if (node.children) {
      node.children.forEach((child) => traverse(child));
    }
  }

  traverse(ast.simplified);
  return Array.from(rules);
}

module.exports = {
  parseCode,
  simplifyAST,
  generateMermaidTree,
  extractGrammarRules,
};
