const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index'); 
const User = require('../models/user-model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');


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
    it('should return 401 if token is missing', async () => {
      const res = await request(app).get('/api/users/current-user');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users/get-all-users', () => {
    it('should return a list of all users if token is valid', async () => {
      const token = jwt.sign({ _id: 'validUserId' }, process.env.JWT_SECRET_KEY);
  
      const res = await request(app)
        .get('/api/users/get-all-users')
        .set('Cookie', `token=${token}`);
  
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
    });
  
    it('should return 401 if token is invalid or missing', async () => {
      const res = await request(app)
        .get('/api/users/get-all-users');
  
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });  

  describe('PUT /api/users/update-user', () => {
    it('should update user data when valid token is provided', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
      const res = await request(app)
        .put('/api/users/update-user')
        .set('Cookie', `token=${token}`)
        .send({ userId: user._id, name: 'Updated Name' });
  
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'User updated successfully');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe('Updated Name');
    });
  
    it('should return 401 if token is missing or invalid', async () => {
      const res = await request(app)
        .put('/api/users/update-user')
        .send({ userId: 'validUserId', name: 'Updated Name' });
  
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/users/enable-2fa', () => {
    it('should enable 2FA for a user', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
      const res = await request(app)
        .put('/api/users/enable-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user._id });
  
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Two-factor authentication enabled successfully.');
    });
  
    it('should return 400 if token is missing', async () => {
      const res = await request(app)
        .put('/api/users/enable-2fa')
        .send({ userId: 'validUserId' });
  
      expect(res.statusCode).toEqual(400);
    });
  
    it('should return 400 if userId is missing', async () => {
      const token = jwt.sign({ _id: 'validUserId' }, process.env.JWT_SECRET_KEY);
      const res = await request(app)
        .put('/api/users/enable-2fa')
        .set('Cookie', `token=${token}`)
        .send({});
  
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/users/generate-2fa', () => {
    it('should generate a 2FA QR code for a user', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
  
      // Generate a token for the user
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
  
      const res = await request(app)
        .post('/api/users/generate-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user._id });
  
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('qrCode');  // Expecting a QR code
      expect(res.body).toHaveProperty('secret'); // Expecting a secret key
    });
  
    it('should return 404 if the user is not found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce(null);
      const token = jwt.sign({ _id: 'nonexistentUserId' }, process.env.JWT_SECRET_KEY);
  
      const res = await request(app)
        .post('/api/users/generate-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'nonexistentUserId' });
  
      expect(res.statusCode).toEqual(404);
      expect(res.text).toEqual('User not found');
    });
  
    it('should return 500 if there is an error generating QR code', async () => {
      jest.spyOn(speakeasy, 'generateSecret').mockImplementationOnce(() => {
        throw new Error('Error generating secret');
      });
  
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
  
      const res = await request(app)
        .post('/api/users/generate-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user._id });
  
      expect(res.statusCode).toEqual(500);
      expect(res.text).toEqual('Error generating secret');
    });
  });
  
  describe('POST /api/users/verify-2fa', () => {
    it('should enable 2FA when OTP is correct', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
  
      // Generate a secret for the user
      const secret = speakeasy.generateSecret({
        name: `WealthWise (${user.email})`,
      });
  
      user.googleAuthSecret = secret.base32;
      await user.save();
  
      // Generate an OTP using the secret
      const token = speakeasy.totp({ secret: user.googleAuthSecret, encoding: 'base32' });
      const res = await request(app)
        .post('/api/users/verify-2fa')
        .send({ userId: user._id, token });
  
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', '2FA verified and enabled');
    });
  
    it('should return 400 if the OTP is invalid', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
  
      const res = await request(app)
        .post('/api/users/verify-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user._id, token: 'invalidOtp' });
  
      expect(res.statusCode).toEqual(400);
    });
  
    it('should return 400 if 2FA is not set up for the user', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
  
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
  
      const res = await request(app)
        .post('/api/users/verify-2fa')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: user._id, token: '123456' });
  
      expect(res.statusCode).toEqual(400);
      expect(res.text).toEqual('2FA is not set up for this user');
    });
  });
});
