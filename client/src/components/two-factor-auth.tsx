import { useEffect, useState } from "react";
import { enableTwoFactor, generate2FA, verify2FA} from "../api-services/users-service";
import { jwtDecode } from "jwt-decode";
import { Button, Input } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function TwoFactorAuth() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [messageState, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const token = location.state?.token;
  const firstTime = location.state?.firstTime || false;

  if (!token) {
    throw new Error("Token is required for Two-Factor Authentication.");
  }

  // Decode the token to extract user information
  const decoded: { _id: string } = jwtDecode(token);
  const userId = decoded._id;

  if (!userId) {
    throw new Error("Invalid token: User ID is missing.");
  }

  useEffect(() => {
    if (firstTime && !qrCode) {
      handleGenerate2FA(); // Automatically generate QR code on first-time setup
    }
  }, [firstTime, qrCode]);

  const handleGenerate2FA = async () => {
    try {
      const data = await generate2FA(userId);
      setQrCode(data.qrCode);
    } catch (err) {
      setMessage("Error generating 2FA setup.");
    }
  };

  const handleVerify2FA = async () => {
    try {
      const data = await verify2FA(userId, otpCode);

      if (firstTime) {
        // Enable 2FA if first time and verification successful
        await enableTwoFactor(userId, token);
      }

      Cookies.set("token", token);
      setMessage(data.message);
      navigate("/");
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error verifying 2FA.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 overflow-auto">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg flex flex-col">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Two-Factor Authentication
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Adding an extra layer of security to your account. Please follow the steps below.
        </p>

        {/* Show Generate QR Button if it's First Time */}
        {firstTime && (
          <Button
            type="primary"
            block
            onClick={handleGenerate2FA}
            style={{ marginBottom: "20px" }}
          >
            Generate QR Code
          </Button>
        )}

        {/* Show QR Code if it exists */}
        {qrCode && (
          <div className="flex flex-col items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Scan this QR Code with Google Authenticator
            </h3>
            <img
              src={qrCode}
              alt="QR Code for Google Authenticator"
              className="max-w-full mb-6"
              style={{ maxHeight: "200px", objectFit: "contain" }} // Ensure QR code fits within the space
            />
          </div>
        )}

        {/* OTP Input Section */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            style={{ padding: "10px" }}
          />
        </div>

        <div className="flex justify-center mb-4">
          <Button
            type="primary"
            onClick={handleVerify2FA}
            style={{ padding: "8px 16px" }}
          >
            Verify OTP
          </Button>
        </div>

        {/* Show Message */}
        {messageState && (
          <p className="text-center text-red-500 mt-4">{messageState}</p>
        )}
      </div>
    </div>
  );
  
};

export default TwoFactorAuth;

