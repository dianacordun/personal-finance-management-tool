import { useEffect, useState } from "react";
import usersGlobalStore, { UsersStoreType } from "../../../store/users-store";
import { message } from "antd";
import Spinner from "../../../components/spinner";
import { createIncome, getAllIncomes, updateIncome, deleteIncome } from "../../../api-services/incomes-service";
import { IncomeType } from "../../../interfaces";

function Homepage() {
  const { currentUser } = usersGlobalStore() as UsersStoreType;
  const [loading, setLoading] = useState(false);

  const [incomes, setIncomes] = useState<IncomeType[]>([]);
  const [incomeData, setIncomeData] = useState<IncomeType>({
    _id: "",
    tag_id: "",
    tag_name: "",
    createdAt: "",
    updatedAt: "",
  });

  useEffect(() => {
    setLoading(true);
    getAllIncomes()
      .then((data) => {
        if (Array.isArray(data)) {
          setIncomes(data);
        } else {
          setIncomes([]);
        }
      })
      .catch(() => {
        message.error("Failed to fetch incomes");
        setIncomes([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateIncome = async () => {
    try {
      const newIncome = await createIncome(incomeData);
      setIncomes((prev) => [...prev, newIncome]);
      message.success("Income created successfully");
    } catch {
      message.error("Failed to create income");
    }
  };

  const handleUpdateIncome = async () => {
    try {
      const updatedIncome = await updateIncome(incomeData);
      setIncomes((prev) =>
        prev.map((income) => (income._id === updatedIncome._id ? updatedIncome : income))
      );
      message.success("Income updated successfully");
    } catch {
      message.error("Failed to update income");
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await deleteIncome({ _id: id });
      setIncomes((prev) => prev.filter((income) => income._id !== id));
      message.success("Income deleted successfully");
    } catch {
      message.error("Failed to delete income");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 text-xl font-bold">
        Welcome, {currentUser?.name}!!!
      </p>
      <div>
        <input
          type="text"
          placeholder="Tag ID"
          value={incomeData.tag_id}
          onChange={(e) => setIncomeData({ ...incomeData, tag_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tag Name"
          value={incomeData.tag_name}
          onChange={(e) => setIncomeData({ ...incomeData, tag_name: e.target.value })}
        />
        <button onClick={handleCreateIncome}>Create Income</button>
        <button onClick={handleUpdateIncome}>Update Income</button>
      </div>
      <ul>
        {(incomes || []).map((income) => (
          <li key={income._id}>
            {income.tag_name}
            <button onClick={() => handleDeleteIncome(income._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Homepage;
