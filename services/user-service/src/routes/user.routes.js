const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Internal sync endpoint (no auth required - called by auth service)
router.post('/sync', userController.syncUser.bind(userController));

router.get('/me', authenticate, userController.getCurrentUser.bind(userController));
router.get('/:id', authenticate, userController.getUserById.bind(userController));
router.get('/', authenticate, userController.getAllUsers.bind(userController));
router.put('/:id', authenticate, userController.updateUser.bind(userController));

module.exports = router;

