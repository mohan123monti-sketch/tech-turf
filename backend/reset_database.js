import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const resetDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully!');

        const db = mongoose.connection.db;
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        
        console.log(`\nFound ${collections.length} collections:`);
        collections.forEach(col => console.log(`  - ${col.name}`));
        
        if (collections.length === 0) {
            console.log('\nDatabase is already empty!');
        } else {
            console.log('\nDropping all collections...');
            
            for (const collection of collections) {
                await db.dropCollection(collection.name);
                console.log(`  ✓ Dropped ${collection.name}`);
            }
            
            console.log('\n✅ Database reset complete! All collections have been dropped.');
        }
        
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed.');
        process.exit(0);
        
    } catch (error) {
        console.error('Error resetting database:', error.message);
        process.exit(1);
    }
};

resetDatabase();
