// server/tests/llm-advice-route.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 
const User = require('../models/user-model');
const Payment = require('../models/payment-model');
const Income = require('../models/income-model');
const Expense = require('../models/expense-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

jest.mock('axios');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  jest.clearAllMocks();
});

describe('LLM Advice Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
      llmUsage: {
        monthlyRequests: 0,
        lastReset: null,
      },
    });

    userId = user._id;
    token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY || 'testsecret'); 
  });

  describe('POST /api/llm/advice', () => {
    it('should return advice for non-premium user under limit', async () => {
      const prompt = "How can I save more money this month?";

      axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: "Consider setting a budget and tracking your expenses to identify areas where you can cut costs.",
              },
            },
          ],
        },
      });

      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({ prompt });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('advice', 'Consider setting a budget and tracking your expenses to identify areas where you can cut costs.');
      
      const user = await User.findById(userId);
      expect(user.llmUsage.monthlyRequests).toBe(1);
    });

    it('should return advice for premium user without limit', async () => {
      const payment = await Payment.create({
        payment_id: 'pay_123456',
        user_id: userId.toString(),
        amount: 49.99,
        currency: 'USD',
        payment_method: 'credit_card',
      });

      const prompt = "What are some investment strategies for beginners?";

      axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: "Start with index funds or ETFs to diversify your portfolio with lower risk.",
              },
            },
          ],
        },
      });

      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({ prompt });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('advice', 'Start with index funds or ETFs to diversify your portfolio with lower risk.');
      
      const user = await User.findById(userId);
      expect(user.llmUsage.monthlyRequests).toBe(0);
    });

    it('should prevent non-premium user from exceeding monthly limit', async () => {
      const prompt = "How to reduce expenses?";

      await User.findByIdAndUpdate(userId, {
        'llmUsage.monthlyRequests': 5,
        'llmUsage.lastReset': new Date(),
      });

      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({ prompt });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'You have reached the free usage limit for this month. Please upgrade to premium for unlimited LLM requests.');
      
      const user = await User.findById(userId);
      expect(user.llmUsage.monthlyRequests).toBe(5);
    });

    it('should reset monthlyRequests if month has changed', async () => {
      const prompt = "Best ways to save money?";

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      await User.findByIdAndUpdate(userId, {
        'llmUsage.monthlyRequests': 5,
        'llmUsage.lastReset': lastMonth,
      });

      axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: "Create a savings plan and stick to it.",
              },
            },
          ],
        },
      });

      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({ prompt });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('advice', 'Create a savings plan and stick to it.');
      
      const user = await User.findById(userId);
      expect(user.llmUsage.monthlyRequests).toBe(1);
      const currentDate = new Date();
      expect(user.llmUsage.lastReset.getMonth()).toBe(currentDate.getMonth());
      expect(user.llmUsage.lastReset.getFullYear()).toBe(currentDate.getFullYear());
    });

    it('should return 400 if prompt is missing', async () => {
      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Prompt is required');
    });

    it('should return 404 if user is not found', async () => {
      const prompt = "How to manage finances better?";

      await User.findByIdAndDelete(userId);

      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({ prompt });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'User not found.');
    });

    it('should return 500 if OpenAI API fails', async () => {
      const prompt = "How can I invest wisely?";

      axios.post.mockRejectedValue(new Error('OpenAI API Error'));

      const res = await request(app)
        .post('/api/llm/advice')
        .set('Cookie', [`token=${token}`])
        .send({ prompt });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to get advice from OpenAI');

      const user = await User.findById(userId);
      expect(user.llmUsage.monthlyRequests).toBe(0);
    });
  });

  describe('POST /api/llm/personalized-advice', () => {
    it('should return personalized advice for premium user', async () => {
      const payment = await Payment.create({
        payment_id: 'pay_123456',
        user_id: userId.toString(),
        amount: 49.99,
        currency: 'USD',
        payment_method: 'credit_card',
      });

      await Income.create([
        { user_id: userId, tag_name: 'salary', amount: 5000, date: '2023-10-01', description: 'Monthly salary', recurring: true, recurrence_interval: 'monthly' },
      ]);

      await Expense.create([
        { user_id: userId, tag_name: 'rent', amount: 1500, date: '2023-10-02', description: 'Monthly rent', recurring: true, recurrence_interval: 'monthly' },
        { user_id: userId, tag_name: 'groceries', amount: 400, date: '2023-10-03', description: 'Weekly groceries', recurring: true, recurrence_interval: 'weekly' },
      ]);

      const mockAdvice = "Consider setting aside 20% of your income for savings and reducing discretionary spending.";

      axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: mockAdvice,
              },
            },
          ],
        },
      });

      const res = await request(app)
        .post('/api/llm/personalized-advice')
        .set('Cookie', [`token=${token}`])
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('advice', mockAdvice);
    });

    it('should prevent non-premium user from accessing personalized advice', async () => {
      const res = await request(app)
        .post('/api/llm/personalized-advice')
        .set('Cookie', [`token=${token}`])
        .send();

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Not premium. Please upgrade to get personalized advice.');
    });

    it('should handle users with no incomes or expenses', async () => {
      const payment = await Payment.create({
        payment_id: 'pay_654321',
        user_id: userId.toString(),
        amount: 49.99,
        currency: 'USD',
        payment_method: 'paypal',
      });

      axios.post.mockResolvedValue({
        data: {
          choices: [
            {
              message: {
                content: "Your financial situation is stable. Consider exploring investment opportunities to grow your savings.",
              },
            },
          ],
        },
      });

      const res = await request(app)
        .post('/api/llm/personalized-advice')
        .set('Cookie', [`token=${token}`])
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('advice', 'Your financial situation is stable. Consider exploring investment opportunities to grow your savings.');
    });

    it('should return 404 if user is not found', async () => {
      await User.findByIdAndDelete(userId);

      const res = await request(app)
        .post('/api/llm/personalized-advice')
        .set('Cookie', [`token=${token}`])
        .send();

      expect(res.statusCode).toEqual(403); 
      expect(res.body).toHaveProperty('message', 'Not premium. Please upgrade to get personalized advice.');
    });

    it('should return 500 if OpenAI API fails', async () => {
      const payment = await Payment.create({
        payment_id: 'pay_789012',
        user_id: userId.toString(),
        amount: 49.99,
        currency: 'USD',
        payment_method: 'credit_card',
      });

      await Income.create([
        { user_id: userId, tag_name: 'salary', amount: 5000, date: '2023-10-01', description: 'Monthly salary', recurring: true, recurrence_interval: 'monthly' },
      ]);

      await Expense.create([
        { user_id: userId, tag_name: 'rent', amount: 1500, date: '2023-10-02', description: 'Monthly rent', recurring: true, recurrence_interval: 'monthly' },
      ]);

      axios.post.mockRejectedValue(new Error('OpenAI API Error'));

      const res = await request(app)
        .post('/api/llm/personalized-advice')
        .set('Cookie', [`token=${token}`])
        .send();

      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty('message', 'Failed to get personalized advice');
    });
  });
});
