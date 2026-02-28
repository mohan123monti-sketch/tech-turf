import asyncHandler from 'express-async-handler';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    const usersCount = await User.countDocuments({});
    const ordersCount = await Order.countDocuments({});
    const productsCount = await Product.countDocuments({});

    // Get all orders and calculate revenue from PAID orders only
    const orders = await Order.find({}).select('totalPrice isPaid');
    const totalRevenue = orders.reduce((acc, order) => {
        // Only count if order is paid AND has a valid totalPrice
        if (order.isPaid && order.totalPrice && !isNaN(order.totalPrice)) {
            return acc + Number(order.totalPrice);
        }
        return acc;
    }, 0);

    // Ensure revenue is a valid number, default to 0
    const revenue = isNaN(totalRevenue) ? 0 : Number(totalRevenue);

    // Get recent activity (Last 5 events)
    const recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('user', 'username')
        .select('createdAt totalPrice isPaid user');

    const recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select('createdAt username email');

    // Combine and format
    let activity = [];

    recentOrders.forEach(order => {
        activity.push({
            type: 'order',
            message: `New order received: ₹${order.totalPrice.toFixed(2)}`,
            subtext: order.user ? `By ${order.user.username}` : 'Guest User',
            time: order.createdAt
        });
        if (order.isPaid) {
            activity.push({
                type: 'payment',
                message: `Payment verified: ₹${order.totalPrice.toFixed(2)}`,
                subtext: `Order #${order._id.toString().slice(-6)}`,
                time: order.updatedAt || order.createdAt
            });
        }
    });

    recentUsers.forEach(user => {
        activity.push({
            type: 'user',
            message: `New user registration`,
            subtext: user.username,
            time: user.createdAt
        });
    });

    // Sort by time descending and take top 5
    activity.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivity = activity.slice(0, 5);

    res.json({
        users: usersCount,
        orders: ordersCount,
        products: productsCount,
        revenue: revenue,
        recentActivity: recentActivity
    });
});

export { getStats };
