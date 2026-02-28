import { body, param } from 'express-validator';
import {
  createOrder,
  getOrderWithItems,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus
} from '../../models/sql/order.model.js';

export const createOrderValidators = [
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isInt({ gt: 0 }),
  body('items.*.quantity').isInt({ gt: 0 }),
  body('total').isFloat({ gt: 0 })
];

export async function createOrderHandler(req, res) {
  const order = await createOrder({
    userId: req.user.id,
    total: req.body.total,
    status: 'pending',
    items: req.body.items
  });

  const fullOrder = await getOrderWithItems(order.id);
  res.status(201).json({ success: true, order: fullOrder });
}

export async function myOrdersHandler(req, res) {
  const orders = await getOrdersByUser(req.user.id);
  res.json({ success: true, orders });
}

export async function allOrdersHandler(req, res) {
  const orders = await getAllOrders();
  res.json({ success: true, orders });
}

export const updateOrderStatusValidators = [
  param('id').isInt({ gt: 0 }),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
];

export async function updateOrderStatusHandler(req, res) {
  const order = await updateOrderStatus(Number(req.params.id), req.body.status);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
}
