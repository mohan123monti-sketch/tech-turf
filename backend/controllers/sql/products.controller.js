import { body, param } from 'express-validator';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../../models/sql/product.model.js';

export const createProductValidators = [
  body('name').isString().isLength({ min: 2, max: 200 }),
  body('description').optional().isString(),
  body('price').isFloat({ gt: 0 }),
  body('imageUrl').optional().isURL()
];

export async function createProductHandler(req, res) {
  const product = await createProduct(req.body);
  res.status(201).json({ success: true, product });
}

export async function listProductsHandler(req, res) {
  const products = await getAllProducts();
  res.json({ success: true, products });
}

export const productIdValidator = [param('id').isInt({ gt: 0 })];

export async function getProductHandler(req, res) {
  const product = await getProductById(Number(req.params.id));
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
}

export async function updateProductHandler(req, res) {
  const product = await updateProduct(Number(req.params.id), req.body);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
}

export async function deleteProductHandler(req, res) {
  const deleted = await deleteProduct(Number(req.params.id));
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, message: 'Product deleted' });
}
