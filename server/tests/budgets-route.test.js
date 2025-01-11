// server/tests/budgets-route.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 
const User = require('../models/user-model');
const Budget = require('../models/budget-model');
const Expense = require('../models/expense-model');
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

describe('Budgets Routes', () => {
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

  describe('POST /api/budgets/create', () => {
    it('should create a new budget', async () => {
      const budgetData = {
        tag_name: 'food',
        limit: 200,
        notification_threshold: 100,
        occupied: 0,
        date: '2023-10-01',
      };

      const res = await request(app)
        .post('/api/budgets/create')
        .set('Cookie', [`token=${token}`])
        .send(budgetData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Budget created successfully');

      const budget = await Budget.findOne({ user_id: userId, tag_name: 'food' });
      expect(budget).toBeTruthy();
      expect(budget.limit).toBe(200);
      expect(budget.notification_threshold).toBe(100);
      expect(budget.occupied).toBe(0);
    });

    it('should not create a budget with notification_threshold greater than limit', async () => {
      const budgetData = {
        tag_name: 'transport',
        limit: 100,
        notification_threshold: 150,
        occupied: 0,
        date: '2023-10-02',
      };

      const res = await request(app)
        .post('/api/budgets/create')
        .set('Cookie', [`token=${token}`])
        .send(budgetData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Limit must be bigger than threshold.');
    });

    it('should not create a budget with invalid tag_name', async () => {
      const budgetData = {
        tag_name: 'invalid-tag',
        limit: 100,
        notification_threshold: 50,
        occupied: 0,
        date: '2023-10-03',
      };

      const res = await request(app)
        .post('/api/budgets/create')
        .set('Cookie', [`token=${token}`])
        .send(budgetData);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid tag_name. Allowed values are: food, school, transport, health, entertainment, utilities, shopping, groceries, travel, rent, subscriptions, insurance, personal care, gifts, charity, savings, investment, others');
    });
  });

  describe('GET /api/budgets/get-all', () => {
    it('should fetch all budgets for the user', async () => {
      await Budget.create([
        { user_id: userId, tag_name: 'food', limit: 200, notification_threshold: 100, occupied: 0, date: '2023-10-01' },
        { user_id: userId, tag_name: 'transport', limit: 150, notification_threshold: 75, occupied: 0, date: '2023-10-02' },
      ]);

      await Expense.create([
        { user_id: userId, tag_name: 'food', amount: 100, date: '2023-10-01', description: 'Dinner', recurring: false },
        { user_id: userId, tag_name: 'transport', amount: 45, date: '2023-10-02', description: 'Bus ticket', recurring: false },
      ]);

      const res = await request(app)
        .get('/api/budgets/get-all')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(2);
      const tagNames = res.body.data.map(budget => budget.tag_name);
      expect(tagNames).toContain('food');
      expect(tagNames).toContain('transport');
      const foodBudget = res.body.data.find(budget => budget.tag_name === 'food');
      const transportBudget = res.body.data.find(budget => budget.tag_name === 'transport');
      expect(foodBudget).toHaveProperty('occupied', 50);
      expect(transportBudget).toHaveProperty('occupied', 30);
    });

    it('should return empty array if no budgets exist', async () => {
      const res = await request(app)
        .get('/api/budgets/get-all')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(0);
    });
  });

  describe('GET /api/budgets/get/:id', () => {
    it('should fetch a budget by ID', async () => {
      const budget = await Budget.create({
        user_id: userId,
        tag_name: 'utilities',
        limit: 300,
        notification_threshold: 150,
        occupied: 100,
        date: '2023-10-03',
      });

      const res = await request(app)
        .get(`/api/budgets/get/${budget._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('tag_name', 'utilities');
      expect(res.body.data).toHaveProperty('limit', 300);
      expect(res.body.data).toHaveProperty('notification_threshold', 150);
      expect(res.body.data).toHaveProperty('occupied', 100);
    });

    it('should return 400 for invalid budget ID format', async () => {
      const res = await request(app)
        .get('/api/budgets/get/invalid-id')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid budget ID format');
    });

    it('should return 404 if budget not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .get(`/api/budgets/get/${nonExistentId}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Budget not found');
    });

    it('should not fetch budget of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const budget = await Budget.create({
        user_id: otherUser._id,
        tag_name: 'entertainment',
        limit: 250,
        notification_threshold: 125,
        occupied: 60,
        date: '2023-10-04',
      });

      const res = await request(app)
        .get(`/api/budgets/get/${budget._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Budget not found');
    });
  });

  describe('PUT /api/budgets/update/:id', () => {
    it('should update an existing budget', async () => {
      const budget = await Budget.create({
        user_id: userId,
        tag_name: 'groceries',
        limit: 180,
        notification_threshold: 90,
        occupied: 45,
        date: '2023-10-05',
      });

      const updateData = {
        limit: 200,
        notification_threshold: 100,
        occupied: 60,
      };

      const res = await request(app)
        .put(`/api/budgets/update/${budget._id}`)
        .set('Cookie', [`token=${token}`])
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Budget updated successfully');
      expect(res.body.data).toHaveProperty('limit', 200);
      expect(res.body.data).toHaveProperty('notification_threshold', 100);
      expect(res.body.data).toHaveProperty('occupied', 60);

      const updatedBudget = await Budget.findById(budget._id);
      expect(updatedBudget.limit).toBe(200);
      expect(updatedBudget.notification_threshold).toBe(100);
      expect(updatedBudget.occupied).toBe(60);
    });

    it('should return 400 for invalid budget ID format', async () => {
      const res = await request(app)
        .put('/api/budgets/update/invalid-id')
        .set('Cookie', [`token=${token}`])
        .send({ limit: 200 });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid budget ID format');
    });

    it('should return 404 if budget not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/budgets/update/${nonExistentId}`)
        .set('Cookie', [`token=${token}`])
        .send({ limit: 200 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Budget not found or not authorized to update');
    });

    it('should not update budget of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const budget = await Budget.create({
        user_id: otherUser._id,
        tag_name: 'investment',
        limit: 300,
        notification_threshold: 150,
        occupied: 75,
        date: '2023-10-07',
      });

      const res = await request(app)
        .put(`/api/budgets/update/${budget._id}`)
        .set('Cookie', [`token=${token}`])
        .send({ limit: 350 });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Budget not found or not authorized to update');
    });
  });

  describe('DELETE /api/budgets/delete/:id', () => {
    it('should delete an existing budget', async () => {
      const budget = await Budget.create({
        user_id: userId,
        tag_name: 'utilities',
        limit: 300,
        notification_threshold: 150,
        occupied: 100,
        date: '2023-10-08',
      });

      const res = await request(app)
        .delete(`/api/budgets/delete/${budget._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Budget deleted successfully');

      const deletedBudget = await Budget.findById(budget._id);
      expect(deletedBudget).toBeNull();
    });

    it('should return 400 for invalid budget ID format', async () => {
      const res = await request(app)
        .delete('/api/budgets/delete/invalid-id')
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid budget ID format');
    });

    it('should return 404 if budget not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/budgets/delete/${nonExistentId}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Budget not found or not authorized to delete');
    });

    it('should not delete budget of another user', async () => {
      const otherUser = await User.create({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: await bcrypt.hash('Password123', 10),
      });

      const budget = await Budget.create({
        user_id: otherUser._id,
        tag_name: 'charity',
        limit: 400,
        notification_threshold: 200,
        occupied: 120,
        date: '2023-10-09',
      });

      const res = await request(app)
        .delete(`/api/budgets/delete/${budget._id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Budget not found or not authorized to delete');
    });
  });
});
