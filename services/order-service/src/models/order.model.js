const { getPool } = require('../database/connection');

class OrderModel {
  async create(orderData) {
    const pool = getPool();
    const { userId, items, totalAmount } = orderData;

    const query = `
      INSERT INTO orders (user_id, items, total_amount, status)
      VALUES ($1, $2::jsonb, $3, 'pending')
      RETURNING id, user_id, items, total_amount, status, created_at
    `;

    const result = await pool.query(query, [userId, JSON.stringify(items), totalAmount]);
    return result.rows[0];
  }

  async findById(orderId) {
    const pool = getPool();
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByUserId(userId) {
    const pool = getPool();
    const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async updateStatus(orderId, status) {
    const pool = getPool();
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, orderId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateOrder(orderId, orderData) {
    const pool = getPool();
    const { items, totalAmount } = orderData;
    
    const query = `
      UPDATE orders 
      SET items = $1::jsonb, total_amount = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [JSON.stringify(items), totalAmount, orderId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}

module.exports = new OrderModel();

