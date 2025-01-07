import { useState } from "react";
import { getLLMAdvice, getPersonalizedLLMAdvice } from "../../../../api-services/llm-services";

const PremiumUserContent = () => {
  const [prompt, setPrompt] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const [personalizedAdvice, setPersonalizedAdvice] = useState("");
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);

  const handleGenerateAdvice = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setAdvice(""); 

    try {
      const result = await getLLMAdvice(prompt);
      setAdvice(result);
    } catch (error) {
      setAdvice("Failed to get advice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePersonalizedAdvice = async () => {
    setLoadingPersonalized(true);
    setPersonalizedAdvice("");

    try {
      const result = await getPersonalizedLLMAdvice();
      setPersonalizedAdvice(result);
    } catch (error: any) {
      setPersonalizedAdvice(error.message); 
    } finally {
      setLoadingPersonalized(false);
    }
  };

  return (
    <div>
      <h1>Premium Financial Advice</h1>
      <p>Welcome to the premium financial advice section!</p>

      <div style={{ marginBottom: "20px" }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your financial question here..."
          rows={5}
          style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        />
      </div>

      <button onClick={handleGenerateAdvice} disabled={loading}>
        {loading ? "Generating..." : "Get Advice (Custom Prompt)"}
      </button>

      {advice && (
        <div style={{ marginTop: "20px" }}>
          <h2>Advice:</h2>
          <p>{advice}</p>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      <button onClick={handleGeneratePersonalizedAdvice} disabled={loadingPersonalized}>
        {loadingPersonalized ? "Generating..." : "Get Personalized Advice"}
      </button>

      {personalizedAdvice && (
        <div style={{ marginTop: "20px" }}>
          <h2>Personalized Advice based on your Incomes & Expenses:</h2>
          <p>{personalizedAdvice}</p>
        </div>
      )}
    </div>
  );
};

export default PremiumUserContent;
