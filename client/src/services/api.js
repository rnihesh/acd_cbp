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
 * Get AI explanation for a node
 */
export const explainNode = async (node, context = "") => {
  const response = await axios.post(`${API_BASE_URL}/explain-node`, {
    node,
    context,
  });
  return response.data;
};

/**
 * Get AI explanation for grammar rules
 */
export const explainGrammar = async (grammarRules, code) => {
  const response = await axios.post(`${API_BASE_URL}/explain-grammar`, {
    grammarRules,
    code,
  });
  return response.data;
};

/**
 * Detect and fix syntax errors
 */
export const detectErrors = async (code, error) => {
  const response = await axios.post(`${API_BASE_URL}/detect-errors`, {
    code,
    error,
  });
  return response.data;
};

/**
 * Get AI service status
 */
export const getAIStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/ai-status`);
  return response.data;
};
