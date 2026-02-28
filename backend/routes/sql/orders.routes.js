import express from 'express';
import {
  allOrdersHandler,
  createOrderHandler,
  createOrderValidators,
  myOrdersHandler,
  updateOrderStatusHandler,
  updateOrderStatusValidators
} from '../../controllers/sql/orders.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';

const router = express.Router();

router.post('/', requireAuth, createOrderValidators, validateRequest, createOrderHandler);
router.get('/mine', requireAuth, myOrdersHandler);
router.get('/', requireAuth, requireAdmin, allOrdersHandler);
router.patch('/:id/status', requireAuth, requireAdmin, updateOrderStatusValidators, validateRequest, updateOrderStatusHandler);

export default router;
