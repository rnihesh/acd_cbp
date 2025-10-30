const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Service with Ollama → Gemini fallback
 */
class AIService {
  constructor() {
    this.ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    this.ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    this.currentProvider = null;
  }

  /**
   * Check if Ollama is available
   */
  async isOllamaAvailable() {
    try {
      console.log(`🔍 Checking Ollama availability at ${this.ollamaUrl}...`);
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 2000,
      });
      console.log(`✅ Ollama is available`);
      return response.status === 200;
    } catch (error) {
      console.log(`❌ Ollama not available: ${error.message}`);
      return false;
    }
  }

  /**
   * Get explanation using Ollama
   */
  async explainWithOllama(prompt) {
    try {
      console.log(`🦙 Using Ollama (model: ${this.ollamaModel})...`);
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt: prompt,
          stream: false,
        },
        { timeout: 30000 }
      );

      console.log(
        `✅ Ollama response received (${response.data.response.length} chars)`
      );
      return {
        success: true,
        provider: "ollama",
        text: response.data.response,
      };
    } catch (error) {
      console.log(`❌ Ollama error: ${error.message}`);
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  /**
   * Get explanation using Gemini
   */
  async explainWithGemini(prompt) {
    try {
      if (!this.geminiApiKey) {
        throw new Error("Gemini API key not configured");
      }

      console.log(`✨ Using Gemini (model: ${this.geminiModel})...`);
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: this.geminiModel });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`✅ Gemini response received (${text.length} chars)`);
      return {
        success: true,
        provider: "gemini",
        text: text,
      };
    } catch (error) {
      console.log(`❌ Gemini error: ${error.message}`);
      throw new Error(`Gemini error: ${error.message}`);
    }
  }

  /**
   * Main explanation method with fallback logic
   */
  async explain(prompt) {
    console.log(
      `🤖 AI request received (prompt: ${prompt.substring(0, 100)}...)`
    );

    // Try Ollama first
    const ollamaAvailable = await this.isOllamaAvailable();

    if (ollamaAvailable) {
      try {
        const result = await this.explainWithOllama(prompt);
        this.currentProvider = "ollama";
        return result;
      } catch (error) {
        console.log(
          `⚠️ Ollama failed, falling back to Gemini: ${error.message}`
        );
      }
    } else {
      console.log(`⚠️ Ollama unavailable, trying Gemini...`);
    }

    // Fallback to Gemini
    try {
      const result = await this.explainWithGemini(prompt);
      this.currentProvider = "gemini";
      return result;
    } catch (error) {
      console.log(`❌ Both AI providers failed`);
      return {
        success: false,
        error: `Both AI providers failed. Ollama: ${
          ollamaAvailable ? "available but errored" : "unavailable"
        }, Gemini: ${error.message}`,
      };
    }
  }

  /**
   * Explain a specific AST node
   */
  async explainNode(node, context = "") {
    const prompt = `You are a compiler expert. Explain this Abstract Syntax Tree (AST) node in simple terms:

Node Type: ${node.type}
${node.operator ? `Operator: ${node.operator}` : ""}
${node.name ? `Name: ${node.name}` : ""}
${node.value !== undefined ? `Value: ${node.value}` : ""}
${context ? `\nContext/Code: ${context}` : ""}

Provide:
1. What this node represents in the code
2. The grammar rule it follows
3. How it fits in the parse tree
4. Any important details about syntax-directed translation

Keep it concise and educational.`;

    return await this.explain(prompt);
  }

  /**
   * Detect and suggest fixes for syntax errors
   */
  async detectErrors(code, error) {
    const prompt = `You are a syntax error detector. Analyze this code and error:

Code:
${code}

Error: ${error}

Provide:
1. What caused the syntax error
2. The grammar rule being violated
3. A specific fix suggestion
4. The corrected code

Be concise and educational.`;

    return await this.explain(prompt);
  }

  /**
   * Explain grammar simplification
   */
  async explainGrammar(grammarRules, code) {
    const prompt = `Explain the following context-free grammar rules used in this code:

Grammar Rules:
${grammarRules.join("\n")}

Code:
${code}

Provide:
1. How these rules derive the given code
2. The derivation steps
3. Any ambiguity in the grammar (if present)
4. Suggestions to simplify or improve

Keep it educational and concise.`;

    return await this.explain(prompt);
  }

  /**
   * Get current AI provider status
   */
  async getStatus() {
    const ollamaAvailable = await this.isOllamaAvailable();
    const geminiConfigured = !!this.geminiApiKey;

    return {
      ollama: {
        available: ollamaAvailable,
        url: this.ollamaUrl,
        model: this.ollamaModel,
      },
      gemini: {
        configured: geminiConfigured,
        model: this.geminiModel,
      },
      currentProvider: this.currentProvider,
    };
  }
}

module.exports = new AIService();
