import axios from "axios";

export const getClientSecret = async (amount: number) => {
  const response = await axios.post("/api/payments/create-payment-intent", {
    amount,
  });
  return response.data;
};

export const isPremiumUser = async (): Promise<boolean> => {
  try {
    const response = await axios.get("/api/payments/is-premium-user");
    return response.data.isPremium;
  } catch (error) {
    console.error("Error checking premium status:", error);
    return false;
  }
};