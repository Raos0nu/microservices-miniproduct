const axios = require('axios');
const logger = require('../utils/logger');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    // Verify token with auth service
    const response = await axios.post(`${authServiceUrl}/api/auth/verify`, { token });
    
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { authenticate };

