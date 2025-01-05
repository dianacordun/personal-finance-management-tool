import { Link, useNavigate } from "react-router-dom";
import WelcomeContent from "../common/welcome-content";
import { Button, Form, Input, message, Modal } from "antd";
import { useState } from "react";
import { loginUser } from "../../../api-services/users-service";
import Cookies from "js-cookie";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: never) => {
    try {
      setLoading(true);
      const response = await loginUser(values);
      
      if (response.user.twoFactorEnabled) {
        // If 2FA is already enabled, navigate to 2FA verification
        navigate("/2fa", { state: { token: response.token } });
      } else {
        // Show modal to let the user decide about enabling 2FA
        setToken(response.token);
        setIsModalVisible(true);
      }
    } catch (error: any) {
      message.error(error.response?.data.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = () => {
    if (token) {
      navigate("/2fa", { state: { token, firstTime: true } });
    }
  };

  const handleSkip2FA = () => {
    if (token) {
      Cookies.set("token", token);
      message.success("Successful login!");
      navigate("/");
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <div className="col-span-1 lg:flex hidden">
        <WelcomeContent />
      </div>
      <div className="h-screen flex items-center justify-center">
        <Form
          className="flex flex-col gap-5 w-96"
          layout="vertical"
          onFinish={onFinish}
        >
          <h1 className="text-2xl font-bold text-gray-600">
            Login your account
          </h1>

          <Form.Item
            name="email"
            required
            label="Email"
            rules={[{ required: true }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            required
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>

          <Link to="/register">Don't have an account? Register</Link>
        </Form>
      </div>

      {/* Modal for enabling 2FA */}
      <Modal
        title="Enable Two-Factor Authentication"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="skip" onClick={handleSkip2FA}>
            Skip for Now
          </Button>,
          <Button key="enable" type="primary" onClick={handleEnable2FA}>
            Enable 2FA
          </Button>,
        ]}
      >
        <p>
          Adding two-factor authentication provides an additional layer of
          security to your account. Would you like to enable it now?
        </p>
      </Modal>

    </div>
  );
}

export default LoginPage;