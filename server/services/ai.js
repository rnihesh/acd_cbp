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
   * Get explanation using Ollama with streaming
   */
  async explainWithOllamaStream(prompt, res) {
    try {
      console.log(
        `🦙 Using Ollama with streaming (model: ${this.ollamaModel})...`
      );

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.ollamaModel,
          prompt: prompt,
          stream: true,
        },
        {
          timeout: 60000,
          responseType: "stream",
        }
      );

      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Send provider info
      res.write(
        `data: ${JSON.stringify({ type: "provider", provider: "ollama" })}\n\n`
      );

      let fullText = "";

      response.data.on("data", (chunk) => {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullText += parsed.response;
              res.write(
                `data: ${JSON.stringify({
                  type: "chunk",
                  text: parsed.response,
                })}\n\n`
              );
            }
            if (parsed.done) {
              console.log(
                `✅ Ollama streaming complete (${fullText.length} chars)`
              );
              res.write(
                `data: ${JSON.stringify({ type: "done", fullText })}\n\n`
              );
              res.end();
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      });

      response.data.on("error", (error) => {
        console.log(`❌ Ollama stream error: ${error.message}`);
        res.write(
          `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
        );
        res.end();
      });
    } catch (error) {
      console.log(`❌ Ollama error: ${error.message}`);
      throw new Error(`Ollama error: ${error.message}`);
    }
  }

  /**
   * Get explanation using Gemini with streaming
   */
  async explainWithGeminiStream(prompt, res) {
    try {
      if (!this.geminiApiKey) {
        throw new Error("Gemini API key not configured");
      }

      console.log(
        `✨ Using Gemini with streaming (model: ${this.geminiModel})...`
      );
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: this.geminiModel });

      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Send provider info
      res.write(
        `data: ${JSON.stringify({ type: "provider", provider: "gemini" })}\n\n`
      );

      const result = await model.generateContentStream(prompt);
      let fullText = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        res.write(
          `data: ${JSON.stringify({ type: "chunk", text: chunkText })}\n\n`
        );
      }

      console.log(`✅ Gemini streaming complete (${fullText.length} chars)`);
      res.write(`data: ${JSON.stringify({ type: "done", fullText })}\n\n`);
      res.end();
    } catch (error) {
      console.log(`❌ Gemini error: ${error.message}`);
      throw new Error(`Gemini error: ${error.message}`);
    }
  }

  /**
   * Stream explanation with fallback logic
   */
  async streamExplain(prompt, res) {
    console.log(
      `🤖 AI streaming request received (prompt: ${prompt.substring(
        0,
        100
      )}...)`
    );

    // Try Ollama first
    const ollamaAvailable = await this.isOllamaAvailable();

    if (ollamaAvailable) {
      try {
        await this.explainWithOllamaStream(prompt, res);
        this.currentProvider = "ollama";
        return;
      } catch (error) {
        console.log(
          `⚠️ Ollama streaming failed, falling back to Gemini: ${error.message}`
        );
      }
    } else {
      console.log(`⚠️ Ollama unavailable, trying Gemini streaming...`);
    }

    // Fallback to Gemini
    try {
      await this.explainWithGeminiStream(prompt, res);
      this.currentProvider = "gemini";
    } catch (error) {
      console.log(`❌ Both AI providers failed for streaming`);
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          error: `Both AI providers failed. Ollama: ${
            ollamaAvailable ? "available but errored" : "unavailable"
          }, Gemini: ${error.message}`,
        })}\n\n`
      );
      res.end();
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
   * Explain a specific AST node (streaming)
   */
  async explainNodeStream(node, context, res) {
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

    return await this.streamExplain(prompt, res);
  }

  /**
   * Explain grammar simplification (streaming)
   */
  async explainGrammarStream(grammarRules, code, res) {
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

    return await this.streamExplain(prompt, res);
  }

  /**
   * Detect and suggest fixes for syntax errors (streaming)
   */
  async detectErrorsStream(code, error, res) {
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

    return await this.streamExplain(prompt, res);
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
