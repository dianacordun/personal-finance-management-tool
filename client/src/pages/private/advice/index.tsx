import { useState, useEffect } from "react";
import { message } from "antd";
import Spinner from "../../../components/spinner";
import BasicUserContent from "./content/basic-user";
import PremiumUserContent from "./content/premium-user";
import { isPremiumUser } from "../../../api-services/payments-service";

const FinancialAdvicePage = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        setLoading(true);
        const response = await isPremiumUser();
        setIsPremium(response);
      } catch (err) {
        message.error("Failed to fetch premium status. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-5">
      {isPremium ? <PremiumUserContent /> : <BasicUserContent />}
    </div>
  );
};

export default FinancialAdvicePage;