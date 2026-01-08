const userModel = require('../models/user.model');
const { comparePassword, hashPassword } = require('../utils/password');
const { generateAccessToken, verifyAccessToken } = require('../utils/jwt');
const axios = require('axios');
const logger = require('../utils/logger');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const user = await userModel.createUser({
        email,
        password,
        firstName,
        lastName
      });

      // Also create user in user service database
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';
        await axios.post(`${userServiceUrl}/api/users/sync`, {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        });
        logger.info(`User synced to user service: ${email}`);
      } catch (error) {
        logger.error('Failed to sync user to user service:', error.message);
        // Continue even if sync fails - user is still created in auth service
      }

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateAccessToken({
        userId: user.id,
        email: user.email
      });

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const decoded = verifyAccessToken(token);
      const user = await userModel.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  }
}

module.exports = new AuthController();

