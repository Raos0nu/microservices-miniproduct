require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Service URLs
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3003';

// Proxy middleware for Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`[Gateway] Proxying ${req.method} ${req.url} to Auth Service`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Error proxying to Auth Service:`, err);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}));

// Proxy middleware for User Service
app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api/users'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`[Gateway] Proxying ${req.method} ${req.url} to User Service`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Error proxying to User Service:`, err);
    res.status(503).json({ error: 'User service unavailable' });
  }
}));

// Proxy middleware for Order Service
app.use('/api/orders', createProxyMiddleware({
  target: ORDER_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`[Gateway] Proxying ${req.method} ${req.url} to Order Service`);
  },
  onError: (err, req, res) => {
    logger.error(`[Gateway] Error proxying to Order Service:`, err);
    res.status(503).json({ error: 'Order service unavailable' });
  }
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info(`Auth Service: ${AUTH_SERVICE}`);
  logger.info(`User Service: ${USER_SERVICE}`);
  logger.info(`Order Service: ${ORDER_SERVICE}`);
});

module.exports = app;

