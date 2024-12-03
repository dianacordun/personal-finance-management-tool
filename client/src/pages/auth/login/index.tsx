import { Link, useNavigate } from "react-router-dom";
import WelcomeContent from "../common/welcome-content";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { loginUser, loginUserWithParams } from "../../../api-services/users-service";
import Cookies from "js-cookie";

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [needs2FA, setNeeds2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginValues, setLoginValues] = useState<never | null>(null); // Store login values for second step
  const navigate = useNavigate();

  // const onFinish = async (values: never) => {
  //   try {
  //     setLoading(true);
  //     const response = await loginUser(values);
  //     message.success(response.message);
  //     Cookies.set("token", response.token);
  //     navigate("/");
  //   } catch (error: any) {
  //     message.error(error.response?.data.message || error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleLogin = async (values: never) => {
    try {
      setLoading(true);
      const response = await loginUser(values);

      if (response.twoFactorRequired) {
        // If 2FA is required, update the state
        setNeeds2FA(true);
        setLoginValues(values); // Save the email and password for OTP validation
        message.info("2FA enabled. Please enter the OTP sent to your authenticator app.");
      } else {
        // Successful login without 2FA
        message.success(response.message);
        Cookies.set("token", response.token);
        navigate("/");
      }
    } catch (error: any) {
      message.error(error.response?.data.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    try {
      setLoading(true);
      const response = await loginUser({
        ...(loginValues as any),
        token: otp,
      } as never);
//       there s an issue with handleOtpSubmit:
// loginUser takes (data: never)
// so this part  gives the following error:
//      Argument of type 'any' is not assignable to parameter of type 'never'.ts(2345)
// const response = await loginUser({
//         ...loginValues,
//         token: otp,
//       });

// TODO: remove never from loginUser, instead use all of the necessary params

// TODO: test backend, frontend functionality

      message.success(response.message);
      Cookies.set("token", response.token);
      navigate("/");
    } catch (error: any) {
      message.error(error.response?.data.message || error.message);
    } finally {
      setLoading(false);
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
          onFinish={needs2FA ? handleOtpSubmit : handleLogin} // Handle OTP or simple login
        >
          <h1 className="text-2xl font-bold text-gray-600">
            {needs2FA ? "Enter OTP" : "Login your account"}
          </h1>

          {!needs2FA && (
            <>
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
            </>
          )}

          {needs2FA && (
            <Form.Item
              name="otp"
              required
              label="One-Time Password (OTP)"
              rules={[{ required: true }]}
            >
              <Input
                placeholder="Enter the OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Form.Item>
          )}

          <Button type="primary" htmlType="submit" block loading={loading}>
            {needs2FA ? "Submit OTP" : "Login"}
          </Button>

          {!needs2FA && (
            <Link to="/register">Don't have an account? Register</Link>
          )}
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;
