const express = require("express");
const router = express.Router();
const Income = require("../models/income-model");
const validateToken = require("../middlewares/validate-token");
const mongoose = require("mongoose");

const validateIncome = require("../validators/income-validator");
const validateUpdateIncome = require("../validators/update-income-validator");

// Create income
router.post("/create", validateToken, validateIncome, async (req, res) => {
  try {
    const userId = req.user._id;
    const incomeData = {
      ...req.body,
      user_id: userId,
      date: req.body.date || new Date(),
    };
    const newIncome = new Income(incomeData);
    await newIncome.save();
    return res.status(201).json({ message: "Income created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get all incomes
router.get("/get-all", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const incomes = await Income.find({ user_id: userId }).sort({ date: -1 });
    return res
      .status(200)
      .json({ data: incomes, message: "Incomes fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get income by ID
router.get("/get/:id", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const incomeId = req.params.id;

    // Validate the incomeId format
    if (!mongoose.isValidObjectId(incomeId)) {
      return res.status(400).json({ message: "Invalid income ID format" });
    }

    const income = await Income.findOne({ _id: incomeId, user_id: userId });
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }

    return res
      .status(200)
      .json({ data: income, message: "Income fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update income
router.put(
  "/update/:id",
  validateToken,
  validateUpdateIncome,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const incomeId = req.params.id;

      const updatedIncome = await Income.findOneAndUpdate(
        { _id: incomeId, user_id: userId },
        req.body,
        { new: true }
      );

      if (!updatedIncome) {
        return res
          .status(404)
          .json({ message: "Income not found or not authorized to update" });
      }

      return res
        .status(200)
        .json({ data: updatedIncome, message: "Income updated successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);

// Delete income
router.delete("/delete/:id", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const incomeId = req.params.id;

    if (!mongoose.isValidObjectId(incomeId)) {
      return res.status(400).json({ message: "Invalid income ID format" });
    }

    const deletedIncome = await Income.findOneAndDelete({
      _id: incomeId,
      user_id: userId,
    });

    if (!deletedIncome) {
      return res
        .status(404)
        .json({ message: "Income not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
