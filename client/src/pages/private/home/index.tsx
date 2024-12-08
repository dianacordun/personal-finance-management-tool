import { useEffect, useState } from "react";
import usersGlobalStore, { UsersStoreType } from "../../../store/users-store";
import Spinner from "../../../components/spinner";

import {
  createExpense,
  getAllExpenses,
  updateExpense,
  deleteExpense,
} from "../../../api-services/expenses-service";

import {
  createIncome,
  getAllIncomes,
  updateIncome,
  deleteIncome,
} from "../../../api-services/incomes-service";

import { ExpenseType, IncomeType } from "../../../interfaces/index";

function Homepage() {
  const { currentUser } = usersGlobalStore() as UsersStoreType;
  const [loading, setLoading] = useState(false);

  // Toggle state: if true, show expenses; if false, show incomes
  const [showExpenses, setShowExpenses] = useState(true);

  // ===== EXPENSE STATES =====
  const [expenses, setExpenses] = useState<ExpenseType[]>([]);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseTag, setNewExpenseTag] = useState("others");
  const [recurring, setRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState("monthly");

  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTag, setEditTag] = useState("others");
  const [editRecurring, setEditRecurring] = useState(false);
  const [editRecurrenceInterval, setEditRecurrenceInterval] =
    useState("monthly");

  // ===== INCOME STATES =====
  const [incomes, setIncomes] = useState<IncomeType[]>([]);
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeDescription, setNewIncomeDescription] = useState("");
  const [newIncomeTag, setNewIncomeTag] = useState("others");
  const [incomeRecurring, setIncomeRecurring] = useState(false);
  const [incomeRecurrenceInterval, setIncomeRecurrenceInterval] =
    useState("monthly");

  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [editIncomeAmount, setEditIncomeAmount] = useState("");
  const [editIncomeDescription, setEditIncomeDescription] = useState("");
  const [editIncomeTag, setEditIncomeTag] = useState("others");
  const [editIncomeRecurring, setEditIncomeRecurring] = useState(false);
  const [editIncomeRecurrenceInterval, setEditIncomeRecurrenceInterval] =
    useState("monthly");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (showExpenses) {
          const data = await getAllExpenses();
          setExpenses(data.data);
        } else {
          const data = await getAllIncomes();
          setIncomes(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showExpenses]);

  // ===== EXPENSE HANDLERS =====
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseAmount || !newExpenseDescription || !newExpenseTag) {
      alert("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      await createExpense({
        amount: parseFloat(newExpenseAmount),
        description: newExpenseDescription,
        tag_name: newExpenseTag,
        recurring: recurring,
        recurrence_interval: recurrenceInterval,
      });
      const data = await getAllExpenses();
      setExpenses(data.data);

      // Reset form fields
      setNewExpenseAmount("");
      setNewExpenseDescription("");
      setNewExpenseTag("others");
      setRecurring(false);
      setRecurrenceInterval("monthly");
    } catch (error) {
      console.error("Error creating expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditingExpense = (expense: ExpenseType) => {
    setEditingExpenseId(expense._id);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description);
    setEditTag(expense.tag_name);
    setEditRecurring(expense.recurring);
    setEditRecurrenceInterval(expense.recurrence_interval);
  };

  const handleSaveExpenseUpdate = async (expenseId: string) => {
    if (!editAmount || !editDescription || !editTag) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await updateExpense({
        _id: expenseId,
        amount: parseFloat(editAmount),
        description: editDescription,
        tag_name: editTag,
        recurring: editRecurring,
        recurrence_interval: editRecurrenceInterval,
      });
      const data = await getAllExpenses();
      setExpenses(data.data);
      setEditingExpenseId(null);
    } catch (error) {
      console.error("Error updating expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    setLoading(true);
    try {
      await deleteExpense({ _id: expenseId });
      const data = await getAllExpenses();
      setExpenses(data.data);
    } catch (error) {
      console.error("Error deleting expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelExpenseEdit = () => {
    setEditingExpenseId(null);
  };

  // ===== INCOME HANDLERS =====
  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncomeAmount || !newIncomeDescription || !newIncomeTag) {
      alert("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      await createIncome({
        amount: parseFloat(newIncomeAmount),
        description: newIncomeDescription,
        tag_name: newIncomeTag,
        recurring: incomeRecurring,
        recurrence_interval: incomeRecurrenceInterval,
      });
      const data = await getAllIncomes();
      setIncomes(data.data);

      // Reset form fields
      setNewIncomeAmount("");
      setNewIncomeDescription("");
      setNewIncomeTag("others");
      setIncomeRecurring(false);
      setIncomeRecurrenceInterval("monthly");
    } catch (error) {
      console.error("Error creating income:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditingIncome = (income: IncomeType) => {
    setEditingIncomeId(income._id);
    setEditIncomeAmount(income.amount.toString());
    setEditIncomeDescription(income.description);
    setEditIncomeTag(income.tag_name);
    setEditIncomeRecurring(income.recurring);
    setEditIncomeRecurrenceInterval(income.recurrence_interval);
  };

  const handleSaveIncomeUpdate = async (incomeId: string) => {
    if (!editIncomeAmount || !editIncomeDescription || !editIncomeTag) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      await updateIncome({
        _id: incomeId,
        amount: parseFloat(editIncomeAmount),
        description: editIncomeDescription,
        tag_name: editIncomeTag,
        recurring: editIncomeRecurring,
        recurrence_interval: editIncomeRecurrenceInterval,
      });
      const data = await getAllIncomes();
      setIncomes(data.data);
      setEditingIncomeId(null);
    } catch (error) {
      console.error("Error updating income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    setLoading(true);
    try {
      await deleteIncome({ _id: incomeId });
      const data = await getAllIncomes();
      setIncomes(data.data);
    } catch (error) {
      console.error("Error deleting income:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelIncomeEdit = () => {
    setEditingIncomeId(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-gray-600 text-xl font-bold">
        Welcome, {currentUser?.name}!!!
      </p>
      <div className="my-4">
        <button
          className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 mr-2"
          onClick={() => setShowExpenses(true)}
        >
          Show Expenses
        </button>
        <button
          className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
          onClick={() => setShowExpenses(false)}
        >
          Show Incomes
        </button>
      </div>

      {showExpenses ? (
        <>
          {/* Create Expense Form */}
          <form
            onSubmit={handleCreateExpense}
            className="my-4 p-4 border rounded"
          >
            <h2 className="text-lg font-bold mb-2">Create a new expense</h2>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="border rounded p-2 w-full"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newExpenseDescription}
                onChange={(e) => setNewExpenseDescription(e.target.value)}
                className="border rounded p-2 w-full"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Tag</label>
              <select
                value={newExpenseTag}
                onChange={(e) => setNewExpenseTag(e.target.value)}
                className="border rounded p-2 w-full"
                required
              >
                <option value="food">food</option>
                <option value="school">school</option>
                <option value="transport">transport</option>
                <option value="health">health</option>
                <option value="entertainment">entertainment</option>
                <option value="utilities">utilities</option>
                <option value="shopping">shopping</option>
                <option value="groceries">groceries</option>
                <option value="travel">travel</option>
                <option value="rent">rent</option>
                <option value="subscriptions">subscriptions</option>
                <option value="insurance">insurance</option>
                <option value="personal care">personal care</option>
                <option value="gifts">gifts</option>
                <option value="charity">charity</option>
                <option value="savings">savings</option>
                <option value="investment">investment</option>
                <option value="others">others</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">
                Is this a recurring expense?
              </label>
              <input
                type="checkbox"
                checked={recurring}
                onChange={(e) => setRecurring(e.target.checked)}
                className="mr-2"
              />
            </div>
            {recurring && (
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">
                  Recurrence Interval
                </label>
                <select
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(e.target.value)}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
              Create
            </button>
          </form>

          {/* Expenses List */}
          <h2 className="text-lg font-bold mt-4 mb-2">Your Expenses</h2>
          {expenses && expenses.length > 0 ? (
            <ul className="space-y-2">
              {expenses.map((expense) => (
                <li
                  key={expense._id}
                  className="p-4 border rounded flex flex-col space-y-2"
                >
                  {editingExpenseId === expense._id ? (
                    // Edit expense form
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="border rounded p-2 w-full"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="border rounded p-2 w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Tag</label>
                        <select
                          value={editTag}
                          onChange={(e) => setEditTag(e.target.value)}
                          className="border rounded p-2 w-full"
                          required
                        >
                          <option value="food">food</option>
                          <option value="school">school</option>
                          <option value="transport">transport</option>
                          <option value="health">health</option>
                          <option value="entertainment">entertainment</option>
                          <option value="utilities">utilities</option>
                          <option value="shopping">shopping</option>
                          <option value="groceries">groceries</option>
                          <option value="travel">travel</option>
                          <option value="rent">rent</option>
                          <option value="subscriptions">subscriptions</option>
                          <option value="insurance">insurance</option>
                          <option value="personal care">personal care</option>
                          <option value="gifts">gifts</option>
                          <option value="charity">charity</option>
                          <option value="savings">savings</option>
                          <option value="investment">investment</option>
                          <option value="others">others</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Is this a recurring expense?
                        </label>
                        <input
                          type="checkbox"
                          checked={editRecurring}
                          onChange={(e) => setEditRecurring(e.target.checked)}
                          className="mr-2"
                        />
                      </div>
                      {editRecurring && (
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Recurrence Interval
                          </label>
                          <select
                            value={editRecurrenceInterval}
                            onChange={(e) =>
                              setEditRecurrenceInterval(e.target.value)
                            }
                            className="border rounded p-2 w-full"
                            required
                          >
                            <option value="daily">daily</option>
                            <option value="weekly">weekly</option>
                            <option value="monthly">monthly</option>
                            <option value="yearly">yearly</option>
                          </select>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleSaveExpenseUpdate(expense._id)}
                          className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelExpenseEdit}
                          className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display expense info
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          Amount: ${expense.amount.toFixed(2)}
                        </p>
                        <p>Description: {expense.description}</p>
                        <p>Tag: {expense.tag_name}</p>
                        <p>
                          Date: {new Date(expense.date).toLocaleDateString()}
                        </p>
                        <p>Recurring: {expense.recurring ? "Yes" : "No"}</p>
                        {expense.recurring && (
                          <p>
                            Recurrence Interval: {expense.recurrence_interval}
                          </p>
                        )}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => startEditingExpense(expense)}
                          className="bg-yellow-500 text-white rounded px-4 py-2 hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense._id)}
                          className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No expenses found.</p>
          )}
        </>
      ) : (
        <>
          {/* Create Income Form */}
          <form
            onSubmit={handleCreateIncome}
            className="my-4 p-4 border rounded"
          >
            <h2 className="text-lg font-bold mb-2">Create a new income</h2>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={newIncomeAmount}
                onChange={(e) => setNewIncomeAmount(e.target.value)}
                className="border rounded p-2 w-full"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newIncomeDescription}
                onChange={(e) => setNewIncomeDescription(e.target.value)}
                className="border rounded p-2 w-full"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">Tag</label>
              <select
                value={newIncomeTag}
                onChange={(e) => setNewIncomeTag(e.target.value)}
                className="border rounded p-2 w-full"
                required
              >
                <option value="salary">salary</option>
                <option value="bonus">bonus</option>
                <option value="investment">investment</option>
                <option value="dividends">dividends</option>
                <option value="interest">interest</option>
                <option value="rental income">rental income</option>
                <option value="freelance">freelance</option>
                <option value="refund">refund</option>
                <option value="grant">grant</option>
                <option value="pension">pension</option>
                <option value="royalties">royalties</option>
                <option value="others">others</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block text-gray-700 mb-1">
                Is this a recurring income?
              </label>
              <input
                type="checkbox"
                checked={incomeRecurring}
                onChange={(e) => setIncomeRecurring(e.target.checked)}
                className="mr-2"
              />
            </div>
            {incomeRecurring && (
              <div className="mb-2">
                <label className="block text-gray-700 mb-1">
                  Recurrence Interval
                </label>
                <select
                  value={incomeRecurrenceInterval}
                  onChange={(e) => setIncomeRecurrenceInterval(e.target.value)}
                  className="border rounded p-2 w-full"
                  required
                >
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
            >
              Create
            </button>
          </form>

          {/* Incomes List */}
          <h2 className="text-lg font-bold mt-4 mb-2">Your Incomes</h2>
          {incomes && incomes.length > 0 ? (
            <ul className="space-y-2">
              {incomes.map((income) => (
                <li
                  key={income._id}
                  className="p-4 border rounded flex flex-col space-y-2"
                >
                  {editingIncomeId === income._id ? (
                    // Edit income form
                    <div className="space-y-2">
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={editIncomeAmount}
                          onChange={(e) => setEditIncomeAmount(e.target.value)}
                          className="border rounded p-2 w-full"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={editIncomeDescription}
                          onChange={(e) =>
                            setEditIncomeDescription(e.target.value)
                          }
                          className="border rounded p-2 w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Tag</label>
                        <select
                          value={editIncomeTag}
                          onChange={(e) => setEditIncomeTag(e.target.value)}
                          className="border rounded p-2 w-full"
                          required
                        >
                          <option value="salary">salary</option>
                          <option value="bonus">bonus</option>
                          <option value="investment">investment</option>
                          <option value="others">others</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">
                          Is this a recurring income?
                        </label>
                        <input
                          type="checkbox"
                          checked={editIncomeRecurring}
                          onChange={(e) =>
                            setEditIncomeRecurring(e.target.checked)
                          }
                          className="mr-2"
                        />
                      </div>
                      {editIncomeRecurring && (
                        <div>
                          <label className="block text-gray-700 mb-1">
                            Recurrence Interval
                          </label>
                          <select
                            value={editIncomeRecurrenceInterval}
                            onChange={(e) =>
                              setEditIncomeRecurrenceInterval(e.target.value)
                            }
                            className="border rounded p-2 w-full"
                            required
                          >
                            <option value="daily">daily</option>
                            <option value="weekly">weekly</option>
                            <option value="monthly">monthly</option>
                            <option value="yearly">yearly</option>
                          </select>
                        </div>
                      )}

                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleSaveIncomeUpdate(income._id)}
                          className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelIncomeEdit}
                          className="bg-gray-500 text-white rounded px-4 py-2 hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display income info
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          Amount: ${income.amount.toFixed(2)}
                        </p>
                        <p>Description: {income.description}</p>
                        <p>Tag: {income.tag_name}</p>
                        <p>
                          Date: {new Date(income.date).toLocaleDateString()}
                        </p>
                        <p>Recurring: {income.recurring ? "Yes" : "No"}</p>
                        {income.recurring && (
                          <p>
                            Recurrence Interval: {income.recurrence_interval}
                          </p>
                        )}
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => startEditingIncome(income)}
                          className="bg-yellow-500 text-white rounded px-4 py-2 hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(income._id)}
                          className="bg-red-500 text-white rounded px-4 py-2 hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No incomes found.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Homepage;
