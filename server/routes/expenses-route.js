const express = require("express");
const router = express.Router();
const Expense = require("../models/expense-model");
const Budget = require("../models/budget-model");
const validateToken = require("../middlewares/validate-token");
const validateExpense = require("../validators/expense-validator");
const validateUpdateExpense = require("../validators/update-expense-validator");
const sendEmail=require("../helpers/send-email")

// Create expense
router.post("/create", validateToken, validateExpense, async (req, res) => {
  try {
    const userId = req.user._id;

    const expenseData = {
      ...req.body,
      user_id: userId,
      date: req.body.date || new Date(),
    };

    const newExpense = new Expense(expenseData);
    await newExpense.save();
    const budgets = await Budget.find({ user_id: userId }).sort({ date: -1 });
    const expenses = await Expense.find({ user_id: userId }).sort({ date: -1 });

    const expenseTotalsByTag = expenses.reduce((acc, expense) => {
      acc[expense.tag_name] = (acc[expense.tag_name] || 0) + expense.amount;
      return acc;
    }, {});

    // Check if any expense exceeds the budget threshold and send email
    budgets.forEach(budget => {
      if (expenseTotalsByTag[budget.tag_name] >= budget.notification_threshold) {
        const emailContent = {
          email: "dragosteleaga@gmail.com",
          subject: "Expense Notification",
          text: `Your ${budget.tag_name} expense has exceeded the threshold.`,
          html: `Your ${budget.tag_name} expense has exceeded the threshold.`
        };
        sendEmail(emailContent);
      }
    });


    return res.status(201).json({ message: "Expense created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


router.get("/get-all", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ user_id: userId }).sort({ date: -1 });

    return res
      .status(200)
      .json({ data: expenses, message: "Expenses fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const mongoose = require("mongoose");
// Get expense by ID
router.get("/get/:id", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;

    // Validate the expenseId format
    if (!mongoose.isValidObjectId(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const expense = await Expense.findOne({ _id: expenseId, user_id: userId });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res
      .status(200)
      .json({ data: expense, message: "Expense fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put(
  "/update/:id",
  validateToken,
  validateUpdateExpense,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const expenseId = req.params.id;

      // Perform the update
      const updatedExpense = await Expense.findOneAndUpdate(
        { _id: expenseId, user_id: userId },
        req.body,
        { new: true }
      );

      if (!updatedExpense) {
        return res
          .status(404)
          .json({ message: "Expense not found or not authorized to update" });
      }

      return res.status(200).json({
        data: updatedExpense,
        message: "Expense updated successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// Delete expense
router.delete("/delete/:id", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;

    // Validate the expense ID format
    if (!mongoose.isValidObjectId(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const deletedExpense = await Expense.findOneAndDelete({
      _id: expenseId,
      user_id: userId,
    });

    if (!deletedExpense) {
      return res
        .status(404)
        .json({ message: "Expense not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
