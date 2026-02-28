import { query } from '../../config/db.js';
import { listUsers } from '../../models/sql/user.model.js';
import { getAllProducts } from '../../models/sql/product.model.js';
import { getAllOrders } from '../../models/sql/order.model.js';

export async function dashboardStats(req, res) {
  const [[users], [products], [orders], [revenue]] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM users').then(r => r.rows),
    query('SELECT COUNT(*)::int AS count FROM products').then(r => r.rows),
    query('SELECT COUNT(*)::int AS count FROM orders').then(r => r.rows),
    query("SELECT COALESCE(SUM(total),0)::numeric AS total FROM orders WHERE status != 'cancelled'").then(r => r.rows)
  ]);

  res.json({
    success: true,
    stats: {
      users: users.count,
      products: products.count,
      orders: orders.count,
      revenue: Number(revenue.total)
    }
  });
}

export async function adminUsers(req, res) {
  const users = await listUsers(200, 0);
  res.json({ success: true, users });
}

export async function adminProducts(req, res) {
  const products = await getAllProducts();
  res.json({ success: true, products });
}

export async function adminOrders(req, res) {
  const orders = await getAllOrders();
  res.json({ success: true, orders });
}
