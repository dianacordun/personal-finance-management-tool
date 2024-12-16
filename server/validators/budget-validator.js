const validateBudget= (req, res, next) => {
    const { limit, notification_threshold, tag_name } =
        req.body;
    // Check if all required fields are provided
    if (!limit || !notification_threshold || !tag_name === undefined) {
        return res.status(400).json({ message: "All fields are required." });
    }
    if(notification_threshold>limit){
        return res.status(400).json({ message: "Limit must be bigger than threshold." });
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



    next();
};

module.exports = validateBudget;
