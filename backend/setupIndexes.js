/**
 * Database Index Setup
 * Run this once to create indexes for optimal query performance
 */

import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import Promo from '../models/promo.model.js';
import Review from '../models/review.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function setupIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // User Indexes
    console.log('\n📑 Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ phone: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('✓ User indexes created');

    // Product Indexes
    console.log('\n📑 Creating Product indexes...');
    await Product.collection.createIndex({ name: 'text', description: 'text' }); // Text search
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ brand: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ stock: 1 });
    await Product.collection.createIndex({ ratingAvg: -1 });
    await Product.collection.createIndex({ createdAt: -1 });
    await Product.collection.createIndex({ slug: 1 }, { unique: true });
    console.log('✓ Product indexes created');

    // Order Indexes
    console.log('\n📑 Creating Order indexes...');
    await Order.collection.createIndex({ user: 1, createdAt: -1 });
    await Order.collection.createIndex({ orderStatus: 1 });
    await Order.collection.createIndex({ paymentMethod: 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    await Order.collection.createIndex({ promoCode: 1 });
    console.log('✓ Order indexes created');

    // Promo Indexes
    console.log('\n📑 Creating Promo indexes...');
    await Promo.collection.createIndex({ code: 1 }, { unique: true });
    await Promo.collection.createIndex({ active: 1 });
    await Promo.collection.createIndex({ startsAt: 1, endsAt: 1 });
    console.log('✓ Promo indexes created');

    // Review Indexes
    console.log('\n📑 Creating Review indexes...');
    await Review.collection.createIndex({ product: 1, user: 1 }, { unique: true });
    await Review.collection.createIndex({ rating: -1 });
    await Review.collection.createIndex({ createdAt: -1 });
    console.log('✓ Review indexes created');

    console.log('\n✅ All indexes created successfully!');
    console.log('\n📊 Index Summary:');
    console.log('- User: email (unique), phone, createdAt');
    console.log('- Product: name/description (text), category, brand, price, stock, rating, slug (unique)');
    console.log('- Order: user+createdAt, orderStatus, paymentMethod, createdAt, promoCode');
    console.log('- Promo: code (unique), active, date range');
    console.log('- Review: product+user (unique), rating, createdAt');

  } catch (error) {
    console.error('❌ Error setting up indexes:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

setupIndexes();
