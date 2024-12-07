
const express = require("express");
const router = express.Router();
const Income = require("../models/income-model");
const validateToken = require("../middlewares/validate-token");

// create income
router.post("/create", validateToken, async (req, res) => {
  try {
    const newIncome = new Income(req.body);
    await newIncome.save();
    return res.status(201).json({ message: "Income created successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get all incomes
router.get("/get-all", validateToken, async (req, res) => {
  try {
    const incomes = await Income.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: incomes, message: "Incomes fetched successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// update income
router.put("/update", validateToken, async (req, res) => {
  try {
    await Income.findByIdAndUpdate(req.body.incomeId, req.body);
    return res.status(200).json({ message: "Income updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// delete income
router.delete("/delete", validateToken, async (req, res) => {
  try {
    await Income.findByIdAndDelete(req.body.incomeId);
    return res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;