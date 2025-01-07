const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const validateToken = require("../middlewares/validate-token");
const PaymentModel = require("../models/payment-model");

router.use("/webhook", bodyParser.raw({ type: 'application/json' }));

// webhook to handle payment success
router.post("/webhook", async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    console.log("Event Type:", event.type);
console.log("Event Data:", event.data);
    
    try {
      const newPayment = new PaymentModel({
        payment_id: paymentIntent.id,
        user_id: paymentIntent.metadata.user_id,
        amount: paymentIntent.amount_received / 100, // convert back to RON
        currency: paymentIntent.currency,
        created_at: new Date(),
        payment_method: paymentIntent.payment_method_types[0],
      });

      await newPayment.save();
      console.log(`Payment for user ${paymentIntent.metadata.user_id} stored in database.`);
    } catch (error) {
      console.error("Error saving payment to DB:", error.message);
    }
  }

  res.status(200).json({ received: true });
});


// create a payment intent for premium
router.post("/create-payment-intent", validateToken, async (req, res) => {
  const { amount } = req.body;
  
  try {
    const userId = req.user._id;

    // Verificăm dacă userul are deja payment
    const existingPayment = await PaymentModel.findOne({ user_id: userId });
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists (already premium)." });
    }

    // Creăm payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // convertim RON în bani (0.01 RON)
      currency: "ron",
      payment_method_types: ["card"],
      description: "WealthWise",
      metadata: { user_id: userId },
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/is-premium", validateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const existingPayment = await PaymentModel.findOne({ user_id: userId });
    return res.status(200).json({ isPremium: !!existingPayment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


module.exports = router;