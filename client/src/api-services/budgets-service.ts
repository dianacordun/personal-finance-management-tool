import axios from "axios";
export const createBudget = async (data:any)=>{
    try{
        const response=await axios.post("api/budgets/create",data);
        return response.data
    } catch (error){
        if (axios.isAxiosError(error)) {
            console.error(
                "Error creating budget:",
                error.response ? error.response.data : error.message
            );
        } else {
            console.error("Error creating budget:", (error as Error).message);
        }
        throw error;
    }
};

export const getAllBudgets = async () => {
    const response = await axios.get("/api/budgets/get-all");
    return response.data;
};

export const updateBudget = async (data: any) => {
    const response = await axios.put(`/api/budgets/update/${data._id}`, data);
    return response.data;
};

export const deleteBudget = async (data: any) => {
    const response = await axios.delete(`/api/budgets/delete/${data._id}`);
    return response.data;
};