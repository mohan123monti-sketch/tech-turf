import express from 'express';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Submission from '../models/submission.model.js';
import Order from '../models/order.model.js';
import Ticket from '../models/ticket.model.js';
import BlogPost from '../models/blogPost.model.js';
import Launch from '../models/launch.model.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics (user count, product count, etc.)
 * @access  Private/Admin
 */
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const submissionCount = await Submission.countDocuments();
        const orderCount = await Order.countDocuments();
        const ticketCount = await Ticket.countDocuments();
        const blogCount = await BlogPost.countDocuments();
        const launchCount = await Launch.countDocuments();

        // Calculate Total Revenue
        const orders = await Order.find({ isPaid: true });
        const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

        res.status(200).json({
            users: userCount,
            products: productCount,
            submissions: submissionCount,
            orders: orderCount,
            tickets: ticketCount,
            blogPosts: blogCount,
            launches: launchCount,
            revenue: totalRevenue
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
