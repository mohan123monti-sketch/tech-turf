import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const adminEmail = 'admin@techturf.com';
    const adminPassword = 'admin123';
    
    let user = await User.findOne({ email: adminEmail });

    if (user) {
        console.log('Admin user found. Updating permissions and resetting password...');
        user.isAdmin = true;
        user.role = 'admin';
        user.password = adminPassword; 
        await user.save();
        console.log('Admin user updated successfully.');
    } else {
        console.log('Creating new admin user...');
        // Check if username 'admin' is taken by someone else with different email
        const usernameCheck = await User.findOne({ username: 'admin' });
        if (usernameCheck) {
            console.log('Username "admin" already taken by another email. Deleting old user to reclaim username...');
            await User.deleteOne({ _id: usernameCheck._id });
        }

        user = await User.create({
            username: 'admin',
            email: adminEmail,
            password: adminPassword,
            isAdmin: true,
            role: 'admin'
        });
        console.log('Admin user created successfully.');
    }

    console.log('\n=============================================');
    console.log('ADMIN ACCESS DETAILS');
    console.log('=============================================');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
