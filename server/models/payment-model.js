const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payment_id: { 
    type: String, 
    required: true 
  },
  user_id: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
  payment_method: { 
    type: String, 
    required: true 
  },
});

const PaymentModel = mongoose.model('payment', paymentSchema);
module.exports = PaymentModel;