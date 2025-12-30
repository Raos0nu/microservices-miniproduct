const { getPool } = require('../database/connection');
const { hashPassword } = require('../utils/password');

class UserModel {
  async createUser(userData) {
    const pool = getPool();
    const { email, password, firstName, lastName } = userData;
    
    const hashedPassword = await hashPassword(password);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, created_at
    `;
    
    const result = await pool.query(query, [email, hashedPassword, firstName, lastName]);
    return result.rows[0];
  }

  async findByEmail(email) {
    const pool = getPool();
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findById(userId) {
    const pool = getPool();
    const query = 'SELECT id, email, first_name, last_name FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

module.exports = new UserModel();

