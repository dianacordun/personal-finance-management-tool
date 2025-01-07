import axios from "axios";

export const getLLMAdvice = async (prompt: string): Promise<string> => {
  try {
    const response = await axios.post("/api/llm/advice", { prompt });
    return response.data.advice;
  } catch (error) {
    console.error("Error getting LLM advice:", error);
    throw new Error("Failed to get financial advice. Please try again.");
  }
};
