import { useState } from "react";
import { generate2FA, verify2FA } from "../api-services/users-service";

const TwoFactorAuth = ({ userId }: { userId: string }) => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

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
      const data = await verify2FA(userId, token);
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error verifying 2FA.");
    }
  };

  return (
    <div>
      <h2>Two-Factor Authentication</h2>
      <button onClick={handleGenerate2FA}>Generate QR Code</button>

      {qrCode && (
        <div>
          <h3>Scan this QR Code with Google Authenticator</h3>
          <img src={qrCode} alt="QR Code for Google Authenticator" />
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Enter OTP"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <button onClick={handleVerify2FA}>Verify OTP</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default TwoFactorAuth;
