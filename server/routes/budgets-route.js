const express = require("express");
const router = express.Router();
const Budget = require("../models/budget-model");
const validateToken = require("../middlewares/validate-token");
const mongoose = require("mongoose");
const validateBudget = require("../validators/budget-validator");
const validateUpdateBudget = require("../validators/update-budget-validator");
const Expense = require("../models/expense-model");

// Create budget
router.post("/create", validateToken,validateBudget, async (req, res) => {
    try {
        const userId = req.user._id;
        const budgetData = {
            ...req.body,
            user_id: userId,
            date: req.body.date || new Date(),
        };
        const newBudget = new Budget(budgetData);
        await newBudget.save();
        return res.status(201).json({ message: "Budget created successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Get all budgets
router.get("/get-all", validateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        const budgets = await Budget.find({ user_id: userId }).sort({ date: -1 });
        const expenses = await Expense.find({ user_id: userId }).sort({ date: -1 });
        const expenseTotalsByTag = expenses.reduce((acc, expense) => {
            acc[expense.tag_name] = (acc[expense.tag_name] || 0) + expense.amount;
            return acc;
        }, {});
        const updatedBudgets = budgets.map(budget => {
            const totalForTag = Math.round(expenseTotalsByTag[budget.tag_name]/budget.limit*100) || 0; // If no expenses for this tag, default to 0
            return {
                ...budget._doc, // Copy all existing budget fields
                occupied: totalForTag
            };
        });
        return res.status(200).json({ data: updatedBudgets, message: "Budgets fetched successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});


// Get budget by ID
router.get("/get/:id", validateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const budgetId = req.params.id;

        // Validate the budgetId format
        if (!mongoose.isValidObjectId(budgetId)) {
            return res.status(400).json({ message: "Invalid budget ID format" });
        }

        const budget = await Budget.findOne({ _id: budgetId, user_id: userId });
        if (!budget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        return res
            .status(200)
            .json({ data: budget, message: "Budget fetched successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Update budget
router.put(
    "/update/:id",
    validateToken,
    validateUpdateBudget,
    async (req, res) => {
        try {

            const userId = req.user._id;
            const budgetId = req.params.id;
            const updatedBudget = await Budget.findOneAndUpdate(
                { _id: budgetId, user_id: userId },
                req.body,
                { new: true }
            );
            if (!updatedBudget) {
                return res
                    .status(404)
                    .json({ message: "Budget not found or not authorized to update" });
            }

            return res
                .status(200)
                .json({ data: updatedBudget, message: "Budget updated successfully" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
);

// Delete budget
router.delete("/delete/:id", validateToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const budgetId = req.params.id;

        if (!mongoose.isValidObjectId(budgetId)) {
            return res.status(400).json({ message: "Invalid budget ID format" });
        }

        const deletedBudget = await Budget.findOneAndDelete({
            _id: budgetId,
            user_id: userId,
        });

        if (!deletedBudget) {
            return res
                .status(404)
                .json({ message: "Budget not found or not authorized to delete" });
        }

        return res.status(200).json({ message: "Budget deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
