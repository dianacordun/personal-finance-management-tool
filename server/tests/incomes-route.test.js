// server/tests/incomes-route.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 
const User = require('../models/user-model');
const Income = require('../models/income-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

describe('Incomes Routes', () => {
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

  describe('POST /api/incomes/create', () => {
    it('should create a new income', async () => {
      const incomeData = {
        tag_name: 'salary',
        amount: 5000,
        description: 'Monthly salary',
        date: '2023-10-01',
        recurring: true,
        recurrence_interval: 'monthly',
      };

      const res = await request(app)
        .post('/api/incomes/create')
        .set('Cookie', [`token=${token}`])
        .send(incomeData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Income created successfully');

      const income = await Income.findOne({ user_id: userId, tag_name: 'salary' });
      expect(income).toBeTruthy();
      expect(income.amount).toBe(5000);
      expect(income.description).toBe('Monthly salary');
    });

    it('should not create an income without required fields', async () => {
      const incomeData = {
        amount: 5000,
      };

      const res = await request(app)
        .post('/api/incomes/create')
        .set('Cookie', [`token=${token}`])
        .send(incomeData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'All fields are required.');
    });

    it('should not create an income with invalid tag_name', async () => {
      const incomeData = {
        tag_name: 'invalid-tag',
        amount: 1000,
        description: 'Invalid income',
        date: '2023-10-02',
        recurring: false,
      };

      const res = await request(app)
        .post('/api/incomes/create')
        .set('Cookie', [`token=${token}`])
        .send(incomeData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid tag_name. Allowed values are: salary, bonus, investment, dividends, interest, rental income, freelance, refund, grant, pension, royalties, others');
    });

    it('should not create an income with negative amount', async () => {
      const incomeData = {
        tag_name: 'bonus',
        amount: -500,
        description: 'Negative bonus',
        date: '2023-10-03',
        recurring: false,
      };

      const res = await request(app)
        .post('/api/incomes/create')
        .set('Cookie', [`token=${token}`])
        .send(incomeData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Amount must be a positive number.');
    });
  });

  describe('GET /api/incomes/get-all', () => {
    it('should fetch all incomes for the user', async () => {
      await Income.create([
        { user_id: userId, tag_name: 'salary', amount: 5000, date: '2023-10-01', description: 'Monthly salary', recurring: true, recurrence_interval: 'monthly' },
        { user_id: userId, tag_name: 'freelance', amount: 1500, date: '2023-10-02', description: 'Freelance project', recurring: false },
      ]);

      const res = await request(app)
        .get('/api/incomes/get-all')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(2);
      const tagNames = res.body.data.map(income => income.tag_name);
      expect(tagNames).toContain('salary');
      expect(tagNames).toContain('freelance');
    });

    it('should return empty array if no incomes exist', async () => {
      const res = await request(app)
        .get('/api/incomes/get-all')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /api/incomes/get/:id', () => {
    it('should fetch an income by ID', async () => {
      const income = await Income.create({
        user_id: userId,
        tag_name: 'investment',
        amount: 2000,
        date: '2023-10-03',
        description: 'Stock dividends',
        recurring: false,
      });

      const res = await request(app)
        .get(`/api/incomes/get/${income._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('tag_name', 'investment');
      expect(res.body.data).toHaveProperty('amount', 2000);
      expect(res.body.data).toHaveProperty('description', 'Stock dividends');
    });

    it('should return 400 for invalid income ID format', async () => {
      const res = await request(app)
        .get('/api/incomes/get/invalid-id')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid income ID format');
    });

    it('should return 404 if income not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/incomes/get/${nonExistentId}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Income not found');
    });

    it('should not fetch income of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const income = await Income.create({
        user_id: otherUser._id,
        tag_name: 'bonus',
        amount: 1000,
        date: '2023-10-04',
        description: 'Performance bonus',
        recurring: false,
      });

      const res = await request(app)
        .get(`/api/incomes/get/${income._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Income not found');
    });
  });

  describe('PUT /api/incomes/update/:id', () => {
    it('should update an existing income', async () => {
      const income = await Income.create({
        user_id: userId,
        tag_name: 'dividends',
        amount: 1500,
        date: '2023-10-05',
        description: 'Quarterly dividends',
        recurring: false,
      });

      const updateData = {
        amount: 1800,
        description: 'Updated quarterly dividends',
      };

      const res = await request(app)
        .put(`/api/incomes/update/${income._id}`)
        .set('Cookie', [`token=${token}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Income updated successfully');
      expect(res.body.data).toHaveProperty('amount', 1800);
      expect(res.body.data).toHaveProperty('description', 'Updated quarterly dividends');

      const updatedIncome = await Income.findById(income._id);
      expect(updatedIncome.amount).toBe(1800);
      expect(updatedIncome.description).toBe('Updated quarterly dividends');
    });

    it('should return 400 for invalid income ID format', async () => {
      const res = await request(app)
        .put('/api/incomes/update/invalid-id')
        .set('Cookie', [`token=${token}`])
        .send({ amount: 2000 });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid income ID format');
    });

    it('should return 404 if income not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/incomes/update/${nonExistentId}`)
        .set('Cookie', [`token=${token}`])
        .send({ amount: 2000 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Income not found or not authorized to update');
    });

    it('should not update income of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const income = await Income.create({
        user_id: otherUser._id,
        tag_name: 'refund',
        amount: 300,
        date: '2023-10-07',
        description: 'Tax refund',
        recurring: false,
      });

      const res = await request(app)
        .put(`/api/incomes/update/${income._id}`)
        .set('Cookie', [`token=${token}`])
        .send({ amount: 400 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Income not found or not authorized to update');
    });
  });

  describe('DELETE /api/incomes/delete/:id', () => {
    it('should delete an existing income', async () => {
      const income = await Income.create({
        user_id: userId,
        tag_name: 'grant',
        amount: 2500,
        date: '2023-10-08',
        description: 'Research grant',
        recurring: false,
      });

      const res = await request(app)
        .delete(`/api/incomes/delete/${income._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Income deleted successfully');

      const deletedIncome = await Income.findById(income._id);
      expect(deletedIncome).toBeNull();
    });

    it('should return 400 for invalid income ID format', async () => {
      const res = await request(app)
        .delete('/api/incomes/delete/invalid-id')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid income ID format');
    });

    it('should return 404 if income not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/incomes/delete/${nonExistentId}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Income not found or not authorized to delete');
    });

    it('should not delete income of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const income = await Income.create({
        user_id: otherUser._id,
        tag_name: 'royalties',
        amount: 1200,
        date: '2023-10-09',
        description: 'Book royalties',
        recurring: false,
      });

      const res = await request(app)
        .delete(`/api/incomes/delete/${income._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Income not found or not authorized to delete');
    });
  });
});
