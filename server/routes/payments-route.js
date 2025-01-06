const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const router = express.Router();
const validateToken = require("../middlewares/validate-token");
const PaymentModel = require("../models/payment-model");

router.post("/create-payment-intent", validateToken, async (req, res) => {
  const { amount } = req.body;
  
  try 
  {
    const userId = req.user._id;

    // Check if the user already has a payment record
    const existingPayment = await PaymentModel.findOne({ user_id: userId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists." });
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // ron - convert to smallest currency unit
      currency: "ron",
      payment_method_types: ["card"],
      description: "WealthWise",
    });

      return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
      return res.status(500).json({ message: error.message });
  }
});

router.get("/is-premium", validateToken, async (req, res) => {
  try
  {
    const userId = req.user._id;

    // Check if the user already has a payment record
    const existingPayment = await PaymentModel.findOne({ user_id: userId });
    return res.status(200).json({ isPremium: !!existingPayment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


module.exports = router;