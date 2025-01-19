// server/tests/payments-route.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');const app = require('../index');
const Payment = require('../models/payment-model');
const User = require('../models/user-model');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

let mongoServer;
let token;
let userId;
let mockSignature = 'mock-signature';

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const user = await User.create({
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'hashedpassword',
  });

  userId = user._id;
  token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY || 'testsecret');
})

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  jest.clearAllMocks();
});

describe('Payment Routes', () => {
  describe('POST /api/payments/create-payment-intent', () => {
    it('should create a payment intent for a non-premium user', async () => {
      const amount = 49.99;

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Cookie', [`token=${token}`])
        .send({ amount });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('clientSecret');
    });

    it('should prevent creating a payment intent if the user is already premium', async () => {
      await Payment.create({
        payment_id: 'pay_test_123',
        user_id: userId,
        amount: 49.99,
        currency: 'ron',
        payment_method: 'card',
      });

      const amount = 49.99;

      const res = await request(app)
        .post('/api/payments/create-payment-intent')
        .set('Cookie', [`token=${token}`])
        .send({ amount });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Payment already exists (already premium).');
    });
  });

  describe('GET /api/payments/is-premium-user', () => {
    it('should return false for a non-premium user', async () => {
      const res = await request(app)
        .get('/api/payments/is-premium-user')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ isPremium: false });
    });

    it('should return true for a premium user', async () => {
      await Payment.create({
        payment_id: 'pay_test_456',
        user_id: userId,
        amount: 49.99,
        currency: 'RON',
        payment_method: 'card',
      });

      const res = await request(app)
        .get('/api/payments/is-premium-user')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ isPremium: true });
    });
  }); 

  describe('POST /api/payments/webhook', () => {  
    it('should return an error for invalid Stripe signature', async () => {
      // Simulate an invalid signature
      const invalidSignature = 'invalid-signature';
      const paymentIntent = {
        id: 'pay_test_789',
        amount_received: 1000,
        currency: 'RON',
        metadata: { user_id: userId },
        payment_method_types: ['card'],
      };
  
      const res = await request(app)
        .post('/api/payments/webhook')
        .set('Stripe-Signature', invalidSignature)
        .send(paymentIntent);
  
      expect(res.statusCode).toEqual(400);
      expect(res.text).toContain('Webhook Error:');
    });
    
  });
});