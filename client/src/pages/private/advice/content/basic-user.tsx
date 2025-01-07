import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { message } from "antd";
import { getClientSecret } from "../../../../api-services/payments-service";
import CheckoutForm from "../../../../components/checkout-form";
import { getLLMAdvice } from "../../../../api-services/llm-services";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("VITE_STRIPE_PUBLIC_KEY is not defined.");
}
const stripePromise = loadStripe(stripePublicKey);

const BasicUserContent = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  const [prompt, setPrompt] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      const { clientSecret } = await getClientSecret(99.99); // PREMIUM PRICE: 99.99 RON 
      setClientSecret(clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      message.error("Failed to initialize payment. Please try again.");
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    window.location.reload(); 
  };

  const handleGetAdvice = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAdvice("");
    try {
      const result = await getLLMAdvice(prompt);
      setAdvice(result);
    } catch (error: any) {
      if (error.message.includes("Upgrade to premium")) {
        message.error("You have reached your free limit of 50 requests. Please upgrade to premium for unlimited usage.");
      } else {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showPaymentForm && clientSecret) {
    return (
      <Elements stripe={stripePromise}>
        <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
      </Elements>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6 text-blue-800">
        Free LLM Advice (max 50 requests / month)
      </h2>

      <p className="text-lg text-gray-800 mb-4">
        You are a Basic User. You can ask up to 50 financial questions each month for free. 
        If you want unlimited queries, you can upgrade to premium for 99.99 RON.
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

      <button
        onClick={handleGetAdvice}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-blue-600 transition duration-200"
      >
        {loading ? "Generating..." : "Get Free Advice"}
      </button>

      {advice && (
        <div style={{ marginTop: "20px" }}>
          <h2>Advice:</h2>
          <p>{advice}</p>
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      <div className="flex justify-center">
        <button
          onClick={handleUpgradeClick}
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-green-700 transition duration-200"
        >
          Upgrade to Premium (Unlimited)
        </button>
      </div>
    </div>
  );
};

export default BasicUserContent;
