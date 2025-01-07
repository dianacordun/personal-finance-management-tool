const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validate-token");
const axios = require("axios");

router.post("/advice", validateToken, async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ advice: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error fetching advice from OpenAI:", error.message);
    res.status(500).json({ message: "Failed to get advice from OpenAI" });
  }
});

module.exports = router;
