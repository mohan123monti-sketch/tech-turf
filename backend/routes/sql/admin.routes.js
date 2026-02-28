import express from 'express';
import {
  adminOrders,
  adminProducts,
  adminUsers,
  dashboardStats
} from '../../controllers/sql/admin.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get('/stats', dashboardStats);
router.get('/users', adminUsers);
router.get('/products', adminProducts);
router.get('/orders', adminOrders);

export default router;
