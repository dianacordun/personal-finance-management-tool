const validateExpense = (req, res, next) => {
  const { amount, description, tag_name, recurring, recurrence_interval } =
    req.body;

  // Check if all required fields are provided
  if (!amount || !description || !tag_name || recurring === undefined) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Validate tag_name
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
  if (!allowedTags.includes(tag_name)) {
    return res.status(400).json({
      message: `Invalid tag_name. Allowed values are: ${allowedTags.join(
        ", "
      )}`,
    });
  }

  // Validate recurrence_interval only if recurring is true
  if (recurring) {
    const allowedIntervals = ["daily", "weekly", "monthly", "yearly"];
    if (
      !recurrence_interval ||
      !allowedIntervals.includes(recurrence_interval)
    ) {
      return res.status(400).json({
        message: `Invalid recurrence_interval. Allowed values are: ${allowedIntervals.join(
          ", "
        )}`,
      });
    }
  }

  next();
};

module.exports = validateExpense;
