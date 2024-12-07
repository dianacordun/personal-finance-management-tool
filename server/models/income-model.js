
const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    tag_id: {
      type: String,
      required: true,
    },
    tag_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const IncomeModel = mongoose.model("incomes", incomeSchema);

module.exports = IncomeModel;