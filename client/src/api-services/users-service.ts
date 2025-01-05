import axios from "axios";

export const registerUser = async (data: never) => {
  const response = await axios.post("/api/users/register", data);
  return response.data;
};

export const loginUser = async (data: never) => {
  const response = await axios.post("/api/users/login", data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get("/api/users/current-user");
  return response.data;
}

export const getAllUsers = async () => {
  const response = await axios.get("/api/users/get-all-users");
  return response.data;
}

export const updateUserData = async (data: any) => {
  const response = await axios.put("/api/users/update-user", data);
  return response.data;
}

export const enableTwoFactor = async (userId: string, token: string) => {
  try {
    const response = await axios.put(
      '/api/users/enable-2fa',
      { userId, twoFactorEnabled: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const generate2FA = async (userId: string) => {
  const response = await axios.post("/api/users/generate-2fa", { userId });
  return response.data;
};

export const verify2FA = async (userId: string, token: string) => {
  const response = await axios.post("/api/users/verify-2fa", { userId, token });
  return response.data;
};