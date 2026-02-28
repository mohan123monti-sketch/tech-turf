import asyncHandler from 'express-async-handler';
import Product from '../models/product.model.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        price,
        imageUrl,
        images,
        category,
        branch,
        tags,
        stock,
        specifications,
        brand,
        deliveryEtaDays,
        warrantyOptions,
        variants,
    } = req.body;

    const product = new Product({
        name,
        description,
        price,
        imageUrl,
        images: Array.isArray(images) ? images : [],
        category,
        branch: branch || 'Tech Turf',
        brand: brand || 'Tech Turf',
        tags: Array.isArray(tags) ? tags : [],
        stock: stock ?? 0,
        specifications: specifications || {},
        deliveryEtaDays: deliveryEtaDays ?? 3,
        warrantyOptions: Array.isArray(warrantyOptions) ? warrantyOptions : [],
        variants: Array.isArray(variants) ? variants : [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        imageUrl,
        images,
        category,
        branch,
        stock,
        tags,
        specifications,
        brand,
        deliveryEtaDays,
        warrantyOptions,
        variants,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.imageUrl = imageUrl;
        if (Array.isArray(images)) {
            product.images = images;
        }
        product.category = category;
        if (branch) {
            product.branch = branch;
        }
        if (brand) {
            product.brand = brand;
        }
        product.stock = stock;
        if (Array.isArray(tags)) {
            product.tags = tags;
        }
        if (specifications) {
            product.specifications = specifications;
        }
        if (deliveryEtaDays !== undefined) {
            product.deliveryEtaDays = deliveryEtaDays;
        }
        if (Array.isArray(warrantyOptions)) {
            product.warrantyOptions = warrantyOptions;
        }
        if (Array.isArray(variants)) {
            product.variants = variants;
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

export {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
};
