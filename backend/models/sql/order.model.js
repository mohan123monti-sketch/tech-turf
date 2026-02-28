import { query } from '../../config/db.js';

export async function createOrder({ userId, total, status = 'pending', items = [] }) {
  const orderResult = await query(
    `INSERT INTO orders (user_id, total, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId, total, status]
  );

  const order = orderResult.rows[0];

  for (const item of items) {
    await query(
      `INSERT INTO order_items (order_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [order.id, item.productId, item.quantity]
    );
  }

  return order;
}

export async function getOrderWithItems(orderId) {
  const orderRes = await query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [orderId]);
  if (!orderRes.rows[0]) return null;

  const itemsRes = await query(
    `SELECT oi.id, oi.quantity, p.id AS product_id, p.name, p.price, p.image_url
     FROM order_items oi
     INNER JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return { ...orderRes.rows[0], items: itemsRes.rows };
}

export async function getOrdersByUser(userId) {
  const { rows } = await query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC',
    [userId]
  );
  return rows;
}

export async function getAllOrders() {
  const { rows } = await query('SELECT * FROM orders ORDER BY id DESC');
  return rows;
}

export async function updateOrderStatus(orderId, status) {
  const { rows } = await query(
    `UPDATE orders SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [orderId, status]
  );
  return rows[0] || null;
}
