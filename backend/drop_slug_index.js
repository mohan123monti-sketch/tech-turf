import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'blogposts' }).toArray();

        if (collections.length > 0) {
            console.log('Dropping slug_1 index from blogposts...');
            await db.collection('blogposts').dropIndex('slug_1');
            console.log('Index dropped successfully');
        } else {
            console.log('Collection blogposts not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

dropIndex();
