const validateExpense = (req, res, next) => {
  const { amount, description, tag_name, recurring, recurrence_interval } =
    req.body;

  // Check if all required fields are provided
  if (!amount || !description || !tag_name || recurring === undefined) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (typeof amount !== 'number' || amount < 0) {
    return res.status(400).json({ message: "Amount must be a positive number." });
}

  // Validate tag_name
  const allowedTags = [
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
