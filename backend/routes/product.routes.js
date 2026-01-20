// --- Imports ---
import express from 'express';
import Product from '../models/product.model.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- Configuration ---
const router = express.Router();

// --- API Routes ---

/**
 * @route   GET /api/products
 * @desc    Fetch all products
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/products
 * @desc    Create a new product (Admin Only)
 * @access  Private/Admin
 */
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            priceType,
            imageUrl,
            category,
            tags,
            stock
        } = req.body;

        const product = new Product({
            name,
            description,
            price,
            priceType: priceType || 'fixed',
            imageUrl,
            category,
            tags,
            stock: stock || 0
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);

    } catch (error) {
        console.error("Error creating product:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/products/:id
 * @desc    Fetch a single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product (Admin Only)
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.price = req.body.price || product.price;
            product.category = req.body.category || product.category;
            product.imageUrl = req.body.imageUrl || product.imageUrl;
            product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product (Admin Only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Export Router ---
export default router;