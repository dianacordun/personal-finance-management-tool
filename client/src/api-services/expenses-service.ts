import axios from "axios";

export const createExpense = async (data: any) => {
  try {
    const response = await axios.post("/api/expenses/create", data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Error creating expense:",
        error.response ? error.response.data : error.message
      );
    } else {
      console.error("Error creating expense:", (error as Error).message);
    }
    throw error;
  }
};

export const getAllExpenses = async () => {
  const response = await axios.get("/api/expenses/get-all");
  return response.data;
};

export const updateExpense = async (data: any) => {
  const response = await axios.put(`/api/expenses/update/${data._id}`, data);
  return response.data;
};

export const deleteExpense = async (data: any) => {
  const response = await axios.delete(`/api/expenses/delete/${data._id}`);
  return response.data;
};
