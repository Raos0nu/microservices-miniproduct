const userModel = require('../models/user.model');
const logger = require('../utils/logger');

class UserController {
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

