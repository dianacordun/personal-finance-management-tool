import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { message, Modal } from "antd";
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

  const [limitReached, setLimitReached] = useState(false);

  const formatText = (text: string) => {
    return text
      .replace(/\d+\./g, "\n$&")
      .replace(/(\d+\.\s*[^:\n]+:)/g, "<strong>$1</strong>");
  };

  const handleUpgradeClick = async () => {
    try {
      const { clientSecret } = await getClientSecret(24.99); 
      setClientSecret(clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      message.error("Failed to initialize payment. Please try again.");
    }
  };

  const handleModalClose = () => {
    setShowPaymentForm(false);
    setClientSecret(null);
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

      const formattedAdvice = formatText(result);
      setAdvice(formattedAdvice);

      setPrompt("");
    } catch (error: any) {
      if (
        (error.response && error.response.status === 403) ||
        (typeof error.message === "string" && error.message.includes("403"))
      ) {
        setLimitReached(true);
      } else {
        setAdvice("An unexpected error occurred. Please try again later.");
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-md">
      {limitReached ? (
        <>
          <h2 className="text-3xl font-semibold text-center mb-6 text-blue-800">
            Access Denied
          </h2>
          <p className="text-lg text-gray-800 mb-4">
            You have reached your free monthly request limit. To continue receiving AI-powered
            financial advice, simply pay <strong>24.99 $</strong> to upgrade and enjoy unlimited
            requests.
          </p>
          <p className="text-lg text-gray-800 mb-6">
            This payment will give you access to all premium features, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 mb-6">
            <li>Financial advice powered by advanced AI technology.</li>
            <li>Budgeting tools to track and manage your finances.</li>
            <li>Exclusive financial resources and insights.</li>
            <li>
              Personalized AI advisor that automatically analyzes your incomes and expenses each
              month to provide custom tips.
            </li>
          </ul>
          <p className="text-md text-gray-700 mb-6">
            Unlock your full financial potential today with our Premium features!
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleUpgradeClick}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-blue-600 transition duration-200"
            >
              Upgrade to Premium
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-semibold text-center mb-6 text-blue-800">
            Free LLM Advice (max 5 requests / month)
          </h2>
          <p className="text-lg text-gray-800 mb-4">
            You can ask up to 5 financial questions each month for free. If you want unlimited
            queries, you can upgrade to premium for 24.99 $.
          </p>
          <p className="text-lg text-gray-800 mb-6">
            Enjoy our AI-powered financial advice within your monthly limit.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your financial question here..."
            rows={5}
            style={{ width: "100%", padding: "10px", fontSize: "16px" }}
          />
          <button
            onClick={handleGetAdvice}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-blue-600 transition duration-200"
          >
            {loading ? "Generating..." : "Get Free Advice"}
          </button>
          {advice && (
            <div className="mt-6">
              <h2>Advice:</h2>
              <div
                style={{ whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: advice }}
              />
            </div>
          )}
        </>
      )}

      <Modal
        title="Upgrade to Premium"
        open={showPaymentForm}
        onCancel={handleModalClose}
        footer={null}
      >
        {clientSecret && (
          <Elements stripe={stripePromise}>
            <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
          </Elements>
        )}
      </Modal>
    </div>
  );

};

export default BasicUserContent;