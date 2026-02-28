import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Promo from './models/promo.model.js';

dotenv.config();

async function createTestPromo() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tech_turf');
    
    // Delete existing test promo
    await Promo.deleteOne({ code: 'TECH50' });
    
    // Create new test promo
    const promo = await Promo.create({
      code: 'TECH50',
      type: 'percent',
      value: 10,
      minOrderValue: 500,
      maxDiscount: 500,
      active: true,
      startsAt: new Date('2026-01-01'),
      endsAt: new Date('2026-12-31')
    });
    
    console.log('✓ Test promo created:', promo.code);
    console.log('Discount: 10% off, Min order: ₹500, Max discount: ₹500');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

createTestPromo();
