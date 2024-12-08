const mongoose = require("mongoose");

const validateUpdateExpense = (req, res, next) => {
  const { amount, description, tag_name, recurring, recurrence_interval } =
    req.body;

  // Validate expense ID if present in params
  const expenseId = req.params.id;
  if (expenseId && !mongoose.isValidObjectId(expenseId)) {
    return res.status(400).json({ message: "Invalid expense ID format" });
  }

  // Check if at least one field is provided
  if (
    amount === undefined &&
    description === undefined &&
    tag_name === undefined &&
    recurring === undefined &&
    recurrence_interval === undefined
  ) {
    return res
      .status(400)
      .json({ message: "At least one field is required to update." });
  }

  // Validate tag_name if provided
  const allowedTags = [
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
  ];
  if (tag_name && !allowedTags.includes(tag_name)) {
    return res.status(400).json({
      message: `Invalid tag_name. Allowed values are: ${allowedTags.join(
        ", "
      )}`,
    });
  }

  // Validate recurrence_interval if provided
  const allowedIntervals = ["daily", "weekly", "monthly", "yearly"];
  if (
    recurring &&
    recurrence_interval &&
    !allowedIntervals.includes(recurrence_interval)
  ) {
    return res.status(400).json({
      message: `Invalid recurrence_interval. Allowed values are: ${allowedIntervals.join(
        ", "
      )}`,
    });
  }

  next(); // Pass control to the next middleware or route handler
};

module.exports = validateUpdateExpense;
