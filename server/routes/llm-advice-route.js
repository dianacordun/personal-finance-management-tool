const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validate-token");
const axios = require("axios");

const PaymentModel = require("../models/payment-model");
const UserModel = require("../models/user-model");
const IncomeModel = require("../models/income-model");
const ExpenseModel = require("../models/expense-model");

router.post("/advice", validateToken, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingPayment = await PaymentModel.findOne({ user_id: userId });
    const isPremium = !!existingPayment;

    if (!isPremium) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); 
      const currentYear = currentDate.getFullYear();

      if (
        !user.llmUsage.lastReset || 
        user.llmUsage.lastReset.getMonth() !== currentMonth ||
        user.llmUsage.lastReset.getFullYear() !== currentYear
      ) {
        user.llmUsage.monthlyRequests = 0;
        user.llmUsage.lastReset = currentDate;
        await user.save();
      }

      if (user.llmUsage.monthlyRequests >= 50) {
        return res.status(403).json({
          message: "You have reached the free usage limit for this month. Please upgrade to premium for unlimited LLM requests."
        });
      }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!isPremium) {
      user.llmUsage.monthlyRequests += 1;
      await user.save();
    }

    res.status(200).json({ advice: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching advice from OpenAI:", error.message);
    res.status(500).json({ message: "Failed to get advice from OpenAI" });
  }
});

router.post("/personalized-advice", validateToken, async (req, res) => {
    try {
      const userId = req.user._id;
  
      const existingPayment = await PaymentModel.findOne({ user_id: userId });
      if (!existingPayment) {
        return res
          .status(403)
          .json({ message: "Not premium. Please upgrade to get personalized advice." });
      }
  
      const incomes = await IncomeModel.find({ user_id: userId });
      const expenses = await ExpenseModel.find({ user_id: userId });
  
      const totalIncome = incomes.reduce((acc, inc) => acc + inc.amount, 0);
      const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  
      const prompt = `
        I am a financial assistant AI. 
        The user has the following total monthly income: ${totalIncome} RON
        and total monthly expenses: ${totalExpenses} RON.
        The user wants personalized financial advice to optimize their spending and savings strategies. 
        Please provide suggestions on how to improve their finances based on these amounts.
      `;
  
      const apiKey = process.env.OPENAI_API_KEY;
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [{ role: "system", content: prompt }],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      return res.status(200).json({
        advice: response.data.choices[0].message.content || "No advice generated",
      });
    } catch (error) {
      console.error("Error in personalized-advice:", error.message);
      return res.status(500).json({ message: "Failed to get personalized advice" });
    }
  });

module.exports = router;
