const express = require("express");
const { connectMongoDB } = require("./config/db-config");
const cookieParser = require('cookie-parser');
const app = express();
require("dotenv").config();

if (process.env.NODE_ENV !== 'test') {
  connectMongoDB();
}

function excludeWebhook(req, res, next) {
  if (req.originalUrl === "/api/payments/webhook") {
    next(); // Skip global JSON parsing for this route
  } else {
    express.json()(req, res, next); // Apply JSON parsing for other routes
  }
}

app.use(excludeWebhook);
app.use(cookieParser());

app.use("/api/users", require("./routes/users-route"));
app.use("/api/payments", require("./routes/payments-route"));
app.use("/api/incomes", require("./routes/incomes-route"));
app.use("/api/expenses", require("./routes/expenses-route"));
app.use("/api/budgets", require("./routes/budgets-route"));
app.use("/api/llm", require("./routes/llm-advice-route"));

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Node+Express Server is running on port ${port}`);
  });
}

module.exports = app;
