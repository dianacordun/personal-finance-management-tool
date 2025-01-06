import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { message } from "antd";
import { getClientSecret } from "../../../../api-services/payments-service";
import CheckoutForm from "../../../../components/checkout-form";


const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error("VITE_STRIPE_PUBLIC_KEY is not defined.");
}

const stripePromise = loadStripe(stripePublicKey);

const BasicUserContent = () => {
  const [clientSecret, setClientSecret] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

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
    window.location.reload(); // Refresh the page to reflect the premium status
  };

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 to-blue-300 rounded-lg shadow-md">
      <h2 className="text-3xl font-semibold text-center mb-6 text-blue-800">
        Access Denied
      </h2>
      <p className="text-lg text-gray-800 mb-4">
        You currently do not have access to premium financial advice and tools. To unlock exclusive content and personalized insights, simply pay 99.99 RON to become a Premium user.
      </p>
      <p className="text-lg text-gray-800 mb-6">
        This payment will give you access to all premium features, including:
      </p>
      <ul className="list-disc pl-6 text-gray-700 mb-6">
        <li>Personalized financial advice powered by advanced AI technology</li>
        <li>Enhanced data privacy with encryption</li>
        <li>Budgeting tools to track and manage your finances</li>
        <li>Exclusive financial resources and insights</li>
      </ul>
      
      <p className="text-md text-gray-700 mb-6">
        Unlock your full financial potential today with our Premium features.
      </p>

      {!showPaymentForm ? (
        <div className="flex justify-center">
          <button
            onClick={handleUpgradeClick}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg text-xl font-bold hover:bg-blue-600 transition duration-200"
          >
            Upgrade to Premium
          </button>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          {clientSecret && (
            <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
          )}
        </Elements>
      )}
    </div>
  );

};

export default BasicUserContent;
