import axios from "axios";

export const getLLMAdvice = async (prompt: string): Promise<string> => {
    try {
      const response = await axios.post("/api/llm/advice", { prompt });
      return response.data.advice;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("403"); 
      } else {
        throw new Error("An error occurred. Please try again later.");
      }
    }
  };
  

export const getPersonalizedLLMAdvice = async (): Promise<string> => {
  try {
    const response = await axios.post("/api/llm/personalized-advice");
    return response.data.advice;
  } catch (error: any) {
    if (error.response && error.response.status === 403) {
      throw new Error("You need to be premium to access personalized advice.");
    }
    console.error("Error getting Personalized LLM advice:", error);
    throw new Error("Failed to get personalized advice. Please try again.");
  }
};
