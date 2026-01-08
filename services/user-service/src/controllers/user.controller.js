const userModel = require('../models/user.model');
const logger = require('../utils/logger');

class UserController {
  async syncUser(req, res, next) {
    try {
      const { id, email, firstName, lastName } = req.body;
      
      if (!id || !email) {
        return res.status(400).json({ error: 'User id and email are required' });
      }

      // Check if user exists
      let user = await userModel.findById(id);
      
      if (!user) {
        // Create user if doesn't exist
        const pool = require('../database/connection').getPool();
        const query = `
          INSERT INTO users (id, email, first_name, last_name, created_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          RETURNING id, email, first_name, last_name, created_at
        `;
        const result = await pool.query(query, [id, email, firstName, lastName]);
        user = result.rows[0];
        logger.info(`User synced: ${email} (ID: ${id})`);
      } else {
        // Update if exists
        const pool = require('../database/connection').getPool();
        const query = `
          UPDATE users 
          SET email = $1, first_name = $2, last_name = $3, updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
          RETURNING id, email, first_name, last_name, created_at
        `;
        const result = await pool.query(query, [email, firstName, lastName, id]);
        user = result.rows[0];
        logger.info(`User updated: ${email} (ID: ${id})`);
      }

      res.json({ message: 'User synced successfully', user });
    } catch (error) {
      logger.error('Sync user error:', error);
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await userModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get current user error:', error);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const user = await userModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Get user error:', error);
      next(error);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await userModel.findAll();
      res.json({ users });
    } catch (error) {
      logger.error('Get all users error:', error);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const userId = parseInt(req.params.id);
      const { firstName, lastName } = req.body;
      
      const user = await userModel.update(userId, { firstName, lastName });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User updated successfully', user });
    } catch (error) {
      logger.error('Update user error:', error);
      next(error);
    }
  }
}

module.exports = new UserController();

