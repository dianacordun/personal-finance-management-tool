import { useEffect, useState } from "react";
import { BudgetType, ExpenseType, IncomeType } from "../../../interfaces";
import { getAllExpenses } from "../../../api-services/expenses-service";
import { getAllIncomes } from "../../../api-services/incomes-service";
import { getAllBudgets } from "../../../api-services/budgets-service";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function ReportsPage() {
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [incomes, setIncomes] = useState<IncomeType[]>([]);
    const [budgets, setBudgets] = useState<BudgetType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const expenseData = await getAllExpenses();
                setExpenses(expenseData.data);

                const incomeData = await getAllIncomes();
                setIncomes(incomeData.data);

                const budgetData = await getAllBudgets();
                setBudgets(budgetData.data);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateTotalExpenses = () => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const calculateTotalIncome = () => {
        return incomes.reduce((total, income) => total + income.amount, 0);
    };

    const calculateBudgetUtilization = () => {
        return budgets.map(budget => ({
            tag: budget.tag_name,
            limit: budget.limit,
            occupied: budget.occupied,
            percentageUsed: ((budget.occupied / budget.limit) * 100).toFixed(2)
        }));
    };

    const groupExpensesByTag = () => {
        const grouped = expenses.reduce((acc, expense) => {
            acc[expense.tag_name] = acc[expense.tag_name] || 0;
            acc[expense.tag_name] += expense.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(grouped).map(([tag, amount]) => ({ tag, amount }));
    };

    const exportToCSV = () => {
        // Calculate budget utilization

        // Section 1: Expenses
        const expenseSection = [
            ["Expenses"], // Section title
            ["Tag", "Amount", "Date"], // Column headers
            ...expenses.map(expense => [
                expense.tag_name,
                expense.amount.toFixed(2),
                expense.date // Assuming `expense.date` is available
            ]),
            [], // Empty row for spacing
        ];

        // Section 2: Incomes
        const incomeSection = [
            ["Incomes"], // Section title
            ["Source", "Amount", "Date"], // Column headers
            ...incomes.map(income => [
                income.tag_name,
                income.amount,
                income.date // Assuming `income.date` is available
            ]),
            [], // Empty row for spacing
        ];

        // Section 3: Budgets
        const budgetSection = [
            ["Budgets"], // Section title
            ["Tag", "Limit", "Occupied", "Percentage Used"], // Column headers
            ...budgets.map(budget => [
                budget.tag_name,
                budget.limit.toFixed(2),
                budget.occupied.toFixed(2),
                ((budget.occupied / budget.limit) * 100).toFixed(2) + '%' // Calculate usage percentage
            ]),
        ];

        // Combine all sections into one CSV
        const csvData = [
            ...expenseSection,
            ...incomeSection,
            ...budgetSection
        ];

        // Convert CSV data to a single CSV string
        const csvContent = csvData.map(row => row.join(",")).join("\n");

        // Create a blob and trigger a file download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'financial_report.csv');
    };



    const exportToPDF = () => {
        const input = document.getElementById('reportsContainer');

        // Ensure the input is not null (TypeScript null check)
        if (!input) {
            console.error("Could not find 'reportsContainer' element.");
            return;
        }

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 190; // Width for A4 paper
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain image aspect ratio

            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight); // Pass 6 arguments to avoid TS error
            pdf.save('expenses_report.pdf');
        }).catch((error) => {
            console.error("Error generating PDF:", error);
        });
    };


    const renderTotalExpenses = () => (
        <div className="report-section bg-white shadow-md p-4 rounded-lg my-4">
            <h2 className="text-2xl font-semibold mb-2">Total Expenses</h2>
            <p className="text-xl text-gray-700"><strong>${calculateTotalExpenses().toFixed(2)}</strong></p>
        </div>
    );

    const renderTotalIncome = () => (
        <div className="report-section bg-white shadow-md p-4 rounded-lg my-4">
            <h2 className="text-2xl font-semibold mb-2">Total Income</h2>
            <p className="text-xl text-gray-700"><strong>${calculateTotalIncome().toFixed(2)}</strong></p>
        </div>
    );

    const renderBudgetUtilization = () => {
        const budgetData = calculateBudgetUtilization();
        return (
            <div className="report-section bg-white shadow-md p-4 rounded-lg my-4">
                <h2 className="text-2xl font-semibold mb-4">Budget Utilization</h2>
                <BarChart width={600} height={300} data={budgetData}>
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="percentageUsed" fill="#8884d8" />
                </BarChart>
            </div>
        );
    };

    const renderExpenseBreakdownByTag = () => {
        const expenseData = groupExpensesByTag();
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

        return (
            <div className="report-section bg-white shadow-md p-4 rounded-lg my-4">
                <h2 className="text-2xl font-semibold mb-4">Expense Breakdown by Category</h2>
                <PieChart width={600} height={400}>
                    <Pie
                        data={expenseData}
                        dataKey="amount"
                        nameKey="tag"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                    >
                        {expenseData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </div>
        );
    };

    if (loading) {
        return <p>Loading reports...</p>;
    }

    return (
        <div id="reportsContainer" className="reports-container mx-auto max-w-4xl p-6">
            <h1 className="text-4xl font-bold text-center mb-6">Financial Reports</h1>
            {renderTotalExpenses()}
            {renderTotalIncome()}
            {renderBudgetUtilization()}
            {renderExpenseBreakdownByTag()}
            <div className="flex justify-center space-x-4 mt-6">
                <button
                    className="bg-green-500 text-white rounded-lg px-6 py-3 transition duration-300 ease-in-out transform hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                    onClick={exportToCSV}
                >
                    Export as CSV
                </button>
                <button
                    className="bg-red-500 text-white rounded-lg px-6 py-3 transition duration-300 ease-in-out transform hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                    onClick={exportToPDF}
                >
                    Export as PDF
                </button>
            </div>
        </div>
    );
}

export default ReportsPage;
