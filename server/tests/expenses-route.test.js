// server/tests/expenses-route.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 
const User = require('../models/user-model');
const Expense = require('../models/expense-model');
const Budget = require('../models/budget-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../helpers/send-email');

jest.mock('../helpers/send-email', () => jest.fn(() => Promise.resolve(true)));

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
});

describe('Expenses Routes', () => {
  let token;
  let userId;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    const user = await User.create({
      name: 'Test User',
      email: 'testuser@example.com',
      password: hashedPassword,
    });

    userId = user._id;
    token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY || 'testsecret');
  });

  describe('POST /api/expenses/create', () => {
    it('should create a new expense', async () => {
      const expenseData = {
        tag_name: 'food',
        amount: 50,
        date: '2023-10-01',
        description: 'Dinner at restaurant',
        recurring: false,
      };

      const res = await request(app)
        .post('/api/expenses/create')
        .set('Cookie', [`token=${token}`])
        .send(expenseData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Expense created successfully');

      const expense = await Expense.findOne({ user_id: userId, tag_name: 'food' });
      expect(expense).toBeTruthy();
      expect(expense.amount).toBe(50);
    });

    it('should not create an expense without required fields', async () => {
      const expenseData = {
        amount: 50,
      };

      const res = await request(app)
        .post('/api/expenses/create')
        .set('Cookie', [`token=${token}`])
        .send(expenseData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should send email if expense exceeds budget threshold', async () => {
      await Budget.create({
        user_id: userId,
        tag_name: 'food',
        notification_threshold: 100,
        occupied: 0,
        limit: 200,
      });

      const expenseData = {
        tag_name: 'food',
        amount: 150,
        date: '2023-10-01',
        description: 'Gourmet dinner',
        recurring: false,
      };

      const res = await request(app)
        .post('/api/expenses/create')
        .set('Cookie', [`token=${token}`])
        .send(expenseData);

      expect(res.statusCode).toEqual(201);
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith({
        email: "dragosteleaga@gmail.com",
        subject: "Expense Notification",
        text: "Your food expense has exceeded the threshold.",
        html: "Your food expense has exceeded the threshold."
      });
    });
  });

  describe('GET /api/expenses/get-all', () => {
    it('should fetch all expenses for the user', async () => {
      await Expense.create([
        { user_id: userId, tag_name: 'food', amount: 50, date: '2023-10-01', description: 'Dinner', recurring: false },
        { user_id: userId, tag_name: 'transport', amount: 20, date: '2023-10-02', description: 'Bus ticket', recurring: false },
      ]);

      const res = await request(app)
        .get('/api/expenses/get-all')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(2);
      const tagNames = res.body.data.map(expense => expense.tag_name);
      expect(tagNames).toContain('food');
      expect(tagNames).toContain('transport');
    });

    it('should return empty array if no expenses exist', async () => {
      const res = await request(app)
        .get('/api/expenses/get-all')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /api/expenses/get/:id', () => {
    it('should fetch an expense by ID', async () => {
      const expense = await Expense.create({
        user_id: userId,
        tag_name: 'utilities',
        amount: 100,
        date: '2023-10-03',
        description: 'Electricity bill',
        recurring: false,
      });

      const res = await request(app)
        .get(`/api/expenses/get/${expense._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('tag_name', 'utilities');
      expect(res.body.data).toHaveProperty('amount', 100);
    });

    it('should return 400 for invalid expense ID format', async () => {
      const res = await request(app)
        .get('/api/expenses/get/invalid-id')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid expense ID format');
    });

    it('should return 404 if expense not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/expenses/get/${nonExistentId}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Expense not found');
    });

    it('should not fetch expense of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const expense = await Expense.create({
        user_id: otherUser._id,
        tag_name: 'entertainment',
        amount: 80,
        date: '2023-10-04',
        description: 'Movie tickets',
        recurring: false,
      });

      const res = await request(app)
        .get(`/api/expenses/get/${expense._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Expense not found');
    });
  });

  describe('PUT /api/expenses/update/:id', () => {
    it('should update an existing expense', async () => {
      const expense = await Expense.create({
        user_id: userId,
        tag_name: 'groceries',
        amount: 60,
        date: '2023-10-05',
        description: 'Weekly groceries',
        recurring: false,
      });

      const updateData = {
        amount: 70,
      };

      const res = await request(app)
        .put(`/api/expenses/update/${expense._id}`)
        .set('Cookie', [`token=${token}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Expense updated successfully');
      expect(res.body.data).toHaveProperty('amount', 70);

      const updatedExpense = await Expense.findById(expense._id);
      expect(updatedExpense.amount).toBe(70);
    });

    it('should return 400 for invalid expense ID format', async () => {
      const res = await request(app)
        .put('/api/expenses/update/invalid-id')
        .set('Cookie', [`token=${token}`])
        .send({ amount: 80 });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid expense ID format');
    });

    it('should return 404 if expense not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/expenses/update/${nonExistentId}`)
        .set('Cookie', [`token=${token}`])
        .send({ amount: 80 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Expense not found or not authorized to update');
    });

    it('should not update expense of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const expense = await Expense.create({
        user_id: otherUser._id,
        tag_name: 'entertainment',
        amount: 80,
        date: '2023-10-04',
        description: 'Concert ticket',
        recurring: false,
      });

      const res = await request(app)
        .put(`/api/expenses/update/${expense._id}`)
        .set('Cookie', [`token=${token}`])
        .send({ amount: 100 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Expense not found or not authorized to update');
    });
  });

  describe('DELETE /api/expenses/delete/:id', () => {
    it('should delete an existing expense', async () => {
      const expense = await Expense.create({
        user_id: userId,
        tag_name: 'utilities',
        amount: 90,
        date: '2023-10-06',
        description: 'Water bill',
        recurring: false,
      });

      const res = await request(app)
        .delete(`/api/expenses/delete/${expense._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Expense deleted successfully');

      const deletedExpense = await Expense.findById(expense._id);
      expect(deletedExpense).toBeNull();
    });

    it('should return 400 for invalid expense ID format', async () => {
      const res = await request(app)
        .delete('/api/expenses/delete/invalid-id')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid expense ID format');
    });

    it('should return 404 if expense not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/expenses/delete/${nonExistentId}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Expense not found or not authorized to delete');
    });

    it('should not delete expense of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const expense = await Expense.create({
        user_id: otherUser._id,
        tag_name: 'entertainment',
        amount: 80,
        date: '2023-10-04',
        description: 'Theater ticket',
        recurring: false,
      });

      const res = await request(app)
        .delete(`/api/expenses/delete/${expense._id}`)
        .set('Cookie', [`token=${token}`])
        .send();

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Expense not found or not authorized to delete');
    });
  });
});
