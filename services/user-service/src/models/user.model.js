const { getPool } = require('../database/connection');

class UserModel {
  async findById(userId) {
    const pool = getPool();
    const query = 'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findAll() {
    const pool = getPool();
    const query = 'SELECT id, email, first_name, last_name, created_at FROM users';
    const result = await pool.query(query);
    return result.rows;
  }

  async update(userId, data) {
    const pool = getPool();
    const { firstName, lastName } = data;
    
    const query = `
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, email, first_name, last_name
    `;
    
    const result = await pool.query(query, [firstName, lastName, userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

module.exports = new UserModel();

