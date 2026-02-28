import express from 'express';
import {
  createProductHandler,
  createProductValidators,
  deleteProductHandler,
  getProductHandler,
  listProductsHandler,
  productIdValidator,
  updateProductHandler
} from '../../controllers/sql/products.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate.js';

const router = express.Router();

router.get('/', listProductsHandler);
router.get('/:id', productIdValidator, validateRequest, getProductHandler);
router.post('/', requireAuth, requireAdmin, createProductValidators, validateRequest, createProductHandler);
router.put('/:id', requireAuth, requireAdmin, productIdValidator, validateRequest, updateProductHandler);
router.delete('/:id', requireAuth, requireAdmin, productIdValidator, validateRequest, deleteProductHandler);

export default router;
