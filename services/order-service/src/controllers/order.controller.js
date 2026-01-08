const orderModel = require('../models/order.model');
const logger = require('../utils/logger');

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { items, totalAmount } = req.body;
      const userId = req.user.id;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      const order = await orderModel.create({
        userId,
        items,
        totalAmount
      });

      logger.info(`Order created: ${order.id} by user ${userId}`);

      res.status(201).json({
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      logger.error('Create order error:', error);
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      const order = await orderModel.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user owns the order or is admin
      if (order.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(order);
    } catch (error) {
      logger.error('Get order error:', error);
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await orderModel.findByUserId(userId);
      res.json({ orders });
    } catch (error) {
      logger.error('Get my orders error:', error);
      next(error);
    }
  }

  async getUserOrders(req, res, next) {
    try {
      const userId = parseInt(req.params.userId);

      // Verify user can access these orders
      if (userId !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const orders = await orderModel.findByUserId(userId);
      res.json({ orders });
    } catch (error) {
      logger.error('Get user orders error:', error);
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user owns the order
      if (order.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updatedOrder = await orderModel.updateStatus(orderId, status);

      logger.info(`Order ${orderId} status updated to ${status}`);

      res.json({ message: 'Order status updated', order: updatedOrder });
    } catch (error) {
      logger.error('Update order status error:', error);
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const orderId = parseInt(req.params.id);
      const { items, totalAmount } = req.body;

      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Verify user owns the order
      if (order.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Can't edit cancelled or delivered orders
      if (order.status === 'cancelled' || order.status === 'delivered') {
        return res.status(400).json({ error: 'Cannot edit cancelled or delivered orders' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order items are required' });
      }

      const updatedOrder = await orderModel.updateOrder(orderId, { items, totalAmount });

      logger.info(`Order ${orderId} updated by user ${req.user.id}`);

      res.json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
      logger.error('Update order error:', error);
      next(error);
    }
  }
}

module.exports = new OrderController();

