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
        priceType: {
            type: String,
            required: true,
            enum: ['one-time', 'subscription'], // Enforce specific values
            default: 'one-time',
        },
        imageUrl: {
            type: String,
            required: false, // We can use placeholders if not provided
        },
        category: {
            type: String,
            required: [true, 'Product category is required'],
            trim: true,
        },
        tags: {
            type: [String], // An array of strings
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