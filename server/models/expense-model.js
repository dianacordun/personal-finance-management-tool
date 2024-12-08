const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    default: "",
  },
  tag_name: {
    type: String,
    enum: [
      "food",
      "school",
      "transport",
      "health",
      "entertainment",
      "utilities",
      "shopping",
      "groceries",
      "travel",
      "rent",
      "subscriptions",
      "insurance",
      "personal care",
      "gifts",
      "charity",
      "savings",
      "investment",
      "others",
    ],
    default: "others",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  recurring: {
    type: Boolean,
    default: false,
  },
  recurrence_interval: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    default: "monthly",
  },
});

const Expense = mongoose.model("Expense", ExpenseSchema);

module.exports = Expense;
