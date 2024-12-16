const mongoose = require("mongoose");

const validateUpdateBudget = (req, res, next) => {
    const { limit, notification_threshold, tag_name } =
        req.body;

    // Validate budget ID if present in params
    const budgetId = req.params.id;
    if (budgetId && !mongoose.isValidObjectId(budgetId)) {
        return res.status(400).json({ message: "Invalid budget ID format" });
    }

    // Check if at least one field is provided
    if (
        limit === undefined &&
        notification_threshold === undefined &&
        tag_name === undefined
    ) {
        return res
            .status(400)
            .json({ message: "At least one field is required to update." });
    }

    if(notification_threshold>limit){
        return res.status(400).json({ message: "Limit must be bigger than threshold." });
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

    next(); // Pass control to the next middleware or route handler
};

module.exports = validateUpdateBudget;
