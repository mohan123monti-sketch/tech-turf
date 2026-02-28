import express from 'express';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import ordersRoutes from './orders.routes.js';
import adminRoutes from './admin.routes.js';
import aiRoutes from './ai.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);

export default router;
