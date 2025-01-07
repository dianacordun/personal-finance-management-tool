import { useState } from "react";
import { getLLMAdvice, getPersonalizedLLMAdvice } from "../../../../api-services/llm-services";

const PremiumUserContent = () => {
  const [prompt, setPrompt] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const [personalizedAdvice, setPersonalizedAdvice] = useState("");
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);

  const formatText = (text: string) => {
    const pattern = /(\d+\.\s*)([^:\n]+)(:)/g;
    const replaced = text.replace(
      pattern,
      `\n<strong>$1$2$3</strong>`
    );

    return replaced;
  };

  const handleGenerateAdvice = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAdvice("");

    try {
      const result = await getLLMAdvice(prompt);
      const formattedAdvice = formatText(result);

      setAdvice(formattedAdvice);

      setPrompt("");
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
      const formattedPersonalizedAdvice = formatText(result);

      setPersonalizedAdvice(formattedPersonalizedAdvice);

      setPrompt("");
    } catch (error: any) {
      setPersonalizedAdvice(error.message);
    } finally {
      setLoadingPersonalized(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6 text-blue-800">
        Premium Financial Advice
      </h2>

      <p className="text-lg text-gray-800 mb-4">
        Welcome to the premium financial advice section! As a premium user, you have <strong>unlimited</strong> queries,
        plus the <strong>Personalized AI Advisor</strong> that automatically analyzes your monthly incomes and expenses to
        provide custom tips.
      </p>

      <p className="text-lg text-gray-800 mb-6">
        Feel free to ask any financial question below, or get a specialized recommendation
        based on your personal finances.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your financial question here..."
          rows={5}
          style={{ width: "100%", padding: "10px", fontSize: "16px" }}
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleGenerateAdvice}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-blue-600 transition duration-200"
        >
          {loading ? "Generating..." : "Get Advice"}
        </button>

        <button
          onClick={handleGeneratePersonalizedAdvice}
          disabled={loadingPersonalized}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-green-700 transition duration-200"
        >
          {loadingPersonalized ? "Generating..." : "Get Personalized Advice"}
        </button>
      </div>

      {advice && (
        <div style={{ marginTop: "20px" }}>
          <h2 className="text-xl font-semibold mb-2">Advice:</h2>
          <div
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: advice }}
          />
        </div>
      )}

      {personalizedAdvice && (
        <div style={{ marginTop: "20px" }}>
          <h2 className="text-xl font-semibold mb-2">
            Personalized Advice based on your Incomes &amp; Expenses:
          </h2>
          <div
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: personalizedAdvice }}
          />
        </div>
      )}
    </div>
  );
};

export default PremiumUserContent;
