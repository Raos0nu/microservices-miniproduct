const express = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, orderController.createOrder.bind(orderController));
router.get('/me', authenticate, orderController.getMyOrders.bind(orderController));
router.get('/:id', authenticate, orderController.getOrderById.bind(orderController));
router.get('/user/:userId', authenticate, orderController.getUserOrders.bind(orderController));
router.put('/:id/status', authenticate, orderController.updateOrderStatus.bind(orderController));
router.put('/:id', authenticate, orderController.updateOrder.bind(orderController));

module.exports = router;

