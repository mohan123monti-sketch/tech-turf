// --- Imports ---
import mongoose from 'mongoose';

// --- Product Schema Definition ---
// This schema defines the structure of a 'Product' document in MongoDB.
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: 0,
        },
        imageUrl: { // For backward compatibility
            type: String,
            required: false,
        },
        images: {
            type: [String],
            default: [],
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            trim: true,
        },
        branch: { // Division category (Tech Turf, Quinta, etc.)
            type: String,
            default: 'Tech Turf'
        },
        brand: {
            type: String,
            default: 'Tech Turf'
        },
        stock: {
            type: Number,
            required: [true, 'Product stock is required'],
            default: 10,
        },
        deliveryEtaDays: {
            type: Number,
            default: 3,
            min: 0,
        },
        warrantyOptions: {
            type: [String],
            default: [],
        },
        variants: {
            type: [
                {
                    name: { type: String },
                    sku: { type: String },
                    color: { type: String },
                    size: { type: String },
                    warranty: { type: String },
                    priceDelta: { type: Number, default: 0 },
                    stock: { type: Number, default: 0 },
                },
            ],
            default: [],
        },
        specifications: {
            type: Map, // Key-value pairs for technical specs
            of: String,
            default: {},
        },
        ratingAvg: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields
        timestamps: true,
    }
);

// --- Model Creation ---
// Create the 'Product' model from the schema
const Product = mongoose.model('Product', productSchema);

// --- Export ---
export default Product;