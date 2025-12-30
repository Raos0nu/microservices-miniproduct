const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/:id', authenticate, userController.getUserById.bind(userController));
router.get('/', authenticate, userController.getAllUsers.bind(userController));
router.put('/:id', authenticate, userController.updateUser.bind(userController));

module.exports = router;

