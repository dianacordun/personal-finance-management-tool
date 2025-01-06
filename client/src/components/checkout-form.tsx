import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { message } from "antd";

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe has not loaded yet
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
        },
      });

      if (error) {
        message.error(error.message || "An error occurred during payment.");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        message.success("Payment successful! Welcome to premium!");
        onSuccess();
      }
    } catch (err) {
      message.error("An error occurred during payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <CardElement options={{ hidePostalCode: true }} />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
};

export default CheckoutForm;
