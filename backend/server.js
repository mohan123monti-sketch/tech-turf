// --- Imports ---
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import projectRoutes from './routes/project.routes.js';
import formRoutes from './routes/form.routes.js';
import chatRoutes from './routes/chat.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import orderRoutes from './routes/order.routes.js';
import blogRoutes from './routes/blog.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import launchRoutes from './routes/launch.routes.js';

// --- Load Environment Variables ---
dotenv.config();

// --- App Configuration ---
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Attach Socket.io to request object
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- Static File Serving ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Serve static files from the frontend directory (one level up)
app.use(express.static(path.join(__dirname, '../')));

// --- Database Connection ---
// --- Database Connection ---
const connectDB = async () => {
    try {
        console.log("Connecting to Database...");
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("CRITICAL: MongoDB Connection FAILED");
        console.error("Error Details:", error.message);
        console.error("Tip: Check if your network blocks MongoDB Atlas, verify your MONGO_URI, or try using a non-SRV connection string.");
        // process.exit(1);
    }
};
connectDB();

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/launches', launchRoutes);

// --- Catch-All Route for Frontend ---
// This ensures that if a user refreshes a page or goes to a URL that isn't an API route,
// they get the frontend index.html (or we can just let express.static handle it).
// For now, express.static is enough for a simple site.

// --- Start Server ---
httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving frontend from: ${path.join(__dirname, '../')}`);
});