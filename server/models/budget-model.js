const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
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
    limit: {
        type: Number,
        required: true,
        min: 0,
    },
    notification_threshold: {
        type: Number,
        required: true,
        min: 0,
    },
    occupied: {
        type: Number,
        required: true,
        min: 0,
    },
});

const Budget = mongoose.model("Budget", BudgetSchema);

module.exports = Budget;
