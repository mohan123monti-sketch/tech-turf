import express from 'express';
import Order from '../models/order.model.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            isPaid: true, // Simulating immediate payment success
            paidAt: Date.now(),
            paymentResult: {
                id: 'SIMULATED_PAYMENT_ID',
                status: 'COMPLETED',
                email_address: req.user.email,
                update_time: new Date().toISOString()
            }
        });

        const createdOrder = await order.save();

        // Emit real-time event
        if (req.io) {
            req.io.emit('new_order', {
                orderId: createdOrder._id,
                user: req.user.username,
                total: createdOrder.totalPrice
            });
        }

        res.status(201).json(createdOrder);
    }
});

/**
 * @route   GET /api/orders/myorders
 * @desc    Get logged in user orders
 * @access  Private
 */
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        // Ensure the user requesting is the owner or an admin
        if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
            res.json(order);
        } else {
            res.status(401).json({ message: 'Not authorized to view this order' });
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

/**
 * @route   GET /api/orders
 * @desc    Get all orders (Admin)
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id username email');
    res.json(orders);
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            const updatedOrder = await order.save();

            // Emit socket event
            if (req.io) {
                req.io.emit('order_updated', { orderId: order._id, status: order.status });
            }

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
