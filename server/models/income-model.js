const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
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
      "salary",
      "bonus",
      "investment",
      "dividends",
      "interest",
      "rental income",
      "freelance",
      "refund",
      "grant",
      "pension",
      "royalties",
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

const IncomeModel = mongoose.model("Incomes", IncomeSchema);

module.exports = IncomeModel;
