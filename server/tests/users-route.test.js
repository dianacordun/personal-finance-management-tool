const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 
const User = require('../models/user-model');
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

describe('User Routes', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');

      const user = await User.findOne({ email: 'john@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('John Doe');
    });

    it('should not register a user with existing email', async () => {
      await User.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123',
      });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('twoFactorEnabled', false);
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Invalid password');
    });

    it('should not login non-existing user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('GET /api/users/current-user', () => {
    let token;
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Password123', salt);
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });

      token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/users/current-user');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });

});
