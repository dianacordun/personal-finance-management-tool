
import axios from "axios";

export const createIncome = async (data: any) => {
  const response = await axios.post("/api/incomes/create", data);
  return response.data;
};

export const getAllIncomes = async () => {
  const response = await axios.get("/api/incomes/get-all");
  return response.data;
};

export const updateIncome = async (data: any) => {
  const response = await axios.put("/api/incomes/update", data);
  return response.data;
};

export const deleteIncome = async (data: any) => {
  const response = await axios.delete("/api/incomes/delete", { data });
  return response.data;
};