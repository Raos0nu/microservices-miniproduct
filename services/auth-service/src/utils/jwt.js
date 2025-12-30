const jwt = require('jsonwebtoken');

function generateAccessToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email
    },
    process.env.JWT_SECRET || 'secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret');
}

module.exports = { generateAccessToken, verifyAccessToken };

