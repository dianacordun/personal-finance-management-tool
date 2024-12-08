import { useState } from "react";
import { generate2FA, verify2FA} from "../api-services/users-service";
import usersGlobalStore, { UsersStoreType } from "../store/users-store";

function TwoFactorAuth() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const { currentUser }: UsersStoreType = usersGlobalStore() as UsersStoreType;

  if (!currentUser) return null;

  const handleGenerate2FA = async () => {
    try {
      const data = await generate2FA(currentUser._id);
      setQrCode(data.qrCode);
    } catch (err) {
      setMessage("Error generating 2FA setup.");
    }
  };

  const handleVerify2FA = async () => {
    try {
      const data = await verify2FA(currentUser._id, token);
      setMessage(data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error verifying 2FA.");
    }
  };

  return (
    <div>
      <h2>Two-Factor Authentication</h2>
      
      <button onClick={handleGenerate2FA} style={{ marginBottom: "20px" }}>
        Generate QR Code
      </button>
  
      {qrCode && (
        <div style={{ marginBottom: "30px" }}>
          <h3>Scan this QR Code with Google Authenticator</h3>
          <img
            src={qrCode}
            alt="QR Code for Google Authenticator"
            style={{ maxWidth: "300px", marginBottom: "20px" }}
          />
        </div>
      )}
  
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter OTP"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ marginRight: "10px", padding: "8px", width: "200px" }}
        />
        <button onClick={handleVerify2FA} style={{ padding: "8px 16px" }}>
          Verify OTP
        </button>
      </div>
  
      {message && <p>{message}</p>}
    </div>
  );
  
};

export default TwoFactorAuth;
