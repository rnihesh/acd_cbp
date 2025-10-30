import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Parse code and get AST + visualization
 */
export const parseCode = async (code, language = "javascript") => {
  const response = await axios.post(`${API_BASE_URL}/parse`, {
    code,
    language,
  });
  return response.data;
};

/**
 * Get AI explanation for a node (streaming)
 */
export const explainNode = async (
  node,
  context = "",
  onChunk,
  onComplete,
  onError
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain-node`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ node, context }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let provider = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "provider") {
              provider = data.provider;
            } else if (data.type === "chunk") {
              onChunk(data.text, provider);
            } else if (data.type === "done") {
              onComplete(data.fullText, provider);
            } else if (data.type === "error") {
              onError(data.error);
            }
          } catch (e) {
            // Silently handle parse errors
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
};

/**
 * Get AI explanation for grammar rules (streaming)
 */
export const explainGrammar = async (
  grammarRules,
  code,
  onChunk,
  onComplete,
  onError
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain-grammar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grammarRules, code }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let provider = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "provider") {
              provider = data.provider;
            } else if (data.type === "chunk") {
              onChunk(data.text, provider);
            } else if (data.type === "done") {
              onComplete(data.fullText, provider);
            } else if (data.type === "error") {
              onError(data.error);
            }
          } catch (e) {
            // Silently handle parse errors
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
};

/**
 * Detect and fix syntax errors (streaming)
 */
export const detectErrors = async (
  code,
  error,
  onChunk,
  onComplete,
  onError
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/detect-errors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code, error }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let provider = null;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "provider") {
              provider = data.provider;
            } else if (data.type === "chunk") {
              onChunk(data.text, provider);
            } else if (data.type === "done") {
              onComplete(data.fullText, provider);
            } else if (data.type === "error") {
              onError(data.error);
            }
          } catch (e) {
            // Silently handle parse errors
          }
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
};

/**
 * Get AI service status
 */
export const getAIStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/ai-status`);
  return response.data;
};
