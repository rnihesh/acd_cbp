const express = require("express");
const router = express.Router();
const {
  parseCode,
  generateMermaidTree,
  extractGrammarRules,
} = require("../services/parser");
const aiService = require("../services/ai");

/**
 * POST /api/parse
 * Parse code and generate AST + Mermaid visualization
 */
router.post("/parse", (req, res) => {
  try {
    const { code, language = "javascript" } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    console.log(
      `📝 Parsing code (${code.length} chars, language: ${language})`
    );
    const result = parseCode(code, language);

    if (!result.success) {
      console.log(`❌ Parse error: ${result.error}`);
      return res.status(400).json({
        success: false,
        error: result.error,
        loc: result.loc,
      });
    }

    console.log(`✅ Parsing successful, generating visualization...`);
    // Generate Mermaid diagram
    const mermaidCode = generateMermaidTree(result);

    // Extract grammar rules
    const grammarRules = extractGrammarRules(result);
    console.log(`📚 Extracted ${grammarRules.length} grammar rules`);

    res.json({
      success: true,
      ast: result.ast,
      simplified: result.simplified,
      mermaid: mermaidCode,
      grammarRules: grammarRules,
    });
  } catch (error) {
    console.log(`❌ Parse route error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/explain-node
 * Get AI explanation for a specific AST node
 */
router.post("/explain-node", async (req, res) => {
  try {
    const { node, context } = req.body;

    if (!node) {
      return res.status(400).json({ error: "Node is required" });
    }

    console.log(`🤖 AI: Explaining node type: ${node.type || "unknown"}`);
    const explanation = await aiService.explainNode(node, context);
    console.log(
      `✅ AI explanation complete (provider: ${explanation.provider})`
    );

    res.json(explanation);
  } catch (error) {
    console.log(`❌ AI explain-node error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/explain-grammar
 * Get AI explanation for grammar rules
 */
router.post("/explain-grammar", async (req, res) => {
  try {
    const { grammarRules, code } = req.body;

    if (!grammarRules || !Array.isArray(grammarRules)) {
      return res.status(400).json({ error: "Grammar rules array is required" });
    }

    console.log(`🤖 AI: Explaining ${grammarRules.length} grammar rules`);
    const explanation = await aiService.explainGrammar(grammarRules, code);
    console.log(
      `✅ AI grammar explanation complete (provider: ${explanation.provider})`
    );

    res.json(explanation);
  } catch (error) {
    console.log(`❌ AI explain-grammar error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/detect-errors
 * Detect and suggest fixes for syntax errors
 */
router.post("/detect-errors", async (req, res) => {
  try {
    const { code, error } = req.body;

    if (!code || !error) {
      return res
        .status(400)
        .json({ error: "Code and error message are required" });
    }

    console.log(`🤖 AI: Detecting errors in code`);
    const explanation = await aiService.detectErrors(code, error);
    console.log(
      `✅ AI error detection complete (provider: ${explanation.provider})`
    );

    res.json(explanation);
  } catch (error) {
    console.log(`❌ AI detect-errors error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ai-status
 * Get current AI provider status
 */
router.get("/ai-status", async (req, res) => {
  try {
    const status = await aiService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
