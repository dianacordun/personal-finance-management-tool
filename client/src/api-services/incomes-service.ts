import axios from "axios";

export const createIncome = async (data: any) => {
  try {
    const response = await axios.post("/api/incomes/create", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error creating income:",
        error.response ? error.response.data : error.message
      );
    } else {
      console.error("Error creating income:", (error as Error).message);
    }
    throw error;
  }
};

export const getAllIncomes = async () => {
  const response = await axios.get("/api/incomes/get-all");
  return response.data;
};

export const updateIncome = async (data: any) => {
  const response = await axios.put(`/api/incomes/update/${data._id}`, data);
  return response.data;
};

export const deleteIncome = async (data: any) => {
  const response = await axios.delete(`/api/incomes/delete/${data._id}`);
  return response.data;
};
