import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import Promo from '../models/promo.model.js';
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../services/emailService.js';
import { validateCODOrder } from '../middleware/codMiddleware.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        promoCode,
        deliverySlot,
        orderNotes,
        giftMessage,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        if (paymentMethod !== 'COD') {
            res.status(400);
            throw new Error('Only Cash on Delivery is available');
        }

        const normalizedOrderItems = orderItems.map((item) => ({
            ...item,
            image: item.image || item.imageUrl || 'https://placehold.co/100',
            qty: Number(item.qty || item.quantity || 1),
            product: item.product || item._id || item.id,
        }));
        const computedItemsPrice = normalizedOrderItems.reduce(
            (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
            0
        );
        const safeItemsPrice = Number(itemsPrice ?? computedItemsPrice);
        const safeTaxPrice = Number(taxPrice ?? 0);
        let safeShippingPrice = Number(shippingPrice ?? 0);
        
        // Validate COD if selected
        if (paymentMethod === 'COD') {
            const codValidation = validateCODOrder({
                totalPrice: Number(totalPrice),
                shippingAddress
            });

            if (!codValidation.valid) {
                res.status(400);
                throw new Error(codValidation.message);
            }

            // Add COD fee if configured
            if (codValidation.fee > 0) {
                safeShippingPrice += codValidation.fee;
            }
        }

        let discountAmount = 0;
        if (promoCode) {
            const promo = await Promo.findOne({ code: String(promoCode).toUpperCase() });
            if (!promo || !promo.active) {
                res.status(400);
                throw new Error('Invalid promo code');
            }

            const now = new Date();
            if (promo.startsAt && now < promo.startsAt) {
                res.status(400);
                throw new Error('Promo code not active yet');
            }
            if (promo.endsAt && now > promo.endsAt) {
                res.status(400);
                throw new Error('Promo code expired');
            }

            const minOrder = Number(promo.minOrderValue || 0);
            if (safeItemsPrice < minOrder) {
                res.status(400);
                throw new Error('Order total does not meet promo requirements');
            }

            if (promo.type === 'percent') {
                discountAmount = safeItemsPrice * (Number(promo.value || 0) / 100);
            } else {
                discountAmount = Number(promo.value || 0);
            }

            if (promo.maxDiscount && promo.maxDiscount > 0) {
                discountAmount = Math.min(discountAmount, promo.maxDiscount);
            }
        }

        const safeTotalPrice = Number(totalPrice ?? (safeItemsPrice + safeTaxPrice + safeShippingPrice - discountAmount));

        const session = await mongoose.startSession();
        let createdOrder;

        try {
            await session.withTransaction(async () => {
                const productIds = normalizedOrderItems.map((item) => item.product);
                const products = await Product.find({ _id: { $in: productIds } }).session(session);

                const productMap = new Map(products.map((p) => [p._id.toString(), p]));
                const stockErrors = [];

                normalizedOrderItems.forEach((item) => {
                    const product = productMap.get(String(item.product));
                    const qty = Number(item.qty || 1);

                    if (!product) {
                        stockErrors.push(`Product not found: ${item.name || item.product}`);
                        return;
                    }

                    if (product.stock < qty) {
                        stockErrors.push(`${product.name} has only ${product.stock} in stock`);
                    }
                });

                if (stockErrors.length > 0) {
                    res.status(400);
                    throw new Error(stockErrors.join(' | '));
                }

                const order = new Order({
                    orderItems: normalizedOrderItems,
                    user: req.user._id,
                    shippingAddress,
                    paymentMethod,
                    itemsPrice: safeItemsPrice,
                    taxPrice: safeTaxPrice,
                    shippingPrice: safeShippingPrice,
                    totalPrice: safeTotalPrice,
                    promoCode: promoCode ? String(promoCode).toUpperCase() : undefined,
                    discountAmount: discountAmount,
                    deliverySlot,
                    orderNotes,
                    giftMessage,
                    isPaid: false,
                    paidAt: null,
                    status: 'Pending',
                });

                createdOrder = await order.save({ session });

                const stockUpdates = normalizedOrderItems.map((item) => ({
                    updateOne: {
                        filter: { _id: item.product },
                        update: { $inc: { stock: -Number(item.qty || 1) } }
                    }
                }));

                if (stockUpdates.length > 0) {
                    await Product.bulkWrite(stockUpdates, { session });
                }
            });
        } finally {
            session.endSession();
        }

        // Send order confirmation email (async, don't wait)
        try {
            const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'username email');
            if (populatedOrder && populatedOrder.user) {
                sendOrderConfirmation(populatedOrder, populatedOrder.user).catch(err => 
                    console.error('Email send failed:', err)
                );
            }
        } catch (emailError) {
            console.error('Error preparing order confirmation email:', emailError);
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'username email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
        };

        const updatedOrder = await order.save();

        if (req.io) {
            req.io.emit('order_updated', {
                orderId: updatedOrder._id,
                status: updatedOrder.status || (updatedOrder.isDelivered ? 'Delivered' : 'Processing'),
                isPaid: updatedOrder.isPaid,
                isDelivered: updatedOrder.isDelivered,
            });
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        order.status = 'Delivered';

        // For COD, if delivered, it's usually paid
        if (order.paymentMethod === 'COD') {
            order.isPaid = true;
            order.paidAt = Date.now();
        }

        const updatedOrder = await order.save();

        if (req.io) {
            req.io.emit('order_updated', {
                orderId: updatedOrder._id,
                status: updatedOrder.status || 'Delivered',
                isPaid: updatedOrder.isPaid,
                isDelivered: updatedOrder.isDelivered,
            });
        }

        try {
            const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'username email');
            if (populatedOrder && populatedOrder.user) {
                sendOrderStatusUpdate(populatedOrder, populatedOrder.user).catch(err =>
                    console.error('Order status email failed:', err)
                );
            }
        } catch (emailError) {
            console.error('Error preparing order status email:', emailError);
        }

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        const previousStatus = order.status;
        order.status = req.body.status || order.status;
        if (req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
            order.trackingUrl = req.body.trackingUrl || order.trackingUrl;
            order.carrier = req.body.carrier || order.carrier;
            if (!req.body.status) {
                order.status = 'Shipped';
            }
        }

        if (req.body.returnStatus) {
            order.returnStatus = req.body.returnStatus;
            order.returnReason = req.body.returnReason || order.returnReason;
        }
        if (order.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
            if (order.paymentMethod === 'COD') {
                order.isPaid = true;
                order.paidAt = Date.now();
            }
        }

        if (order.status === 'Cancelled' && previousStatus !== 'Cancelled') {
            const restockUpdates = order.orderItems.map((item) => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { stock: Number(item.qty || 1) } }
                }
            }));
            if (restockUpdates.length > 0) {
                await Product.bulkWrite(restockUpdates);
            }
        }

        const updatedOrder = await order.save();

        if (req.io) {
            req.io.emit('order_updated', {
                orderId: updatedOrder._id,
                status: updatedOrder.status,
                isPaid: updatedOrder.isPaid,
                isDelivered: updatedOrder.isDelivered,
            });
        }

        try {
            const populatedOrder = await Order.findById(updatedOrder._id).populate('user', 'username email');
            if (populatedOrder && populatedOrder.user) {
                sendOrderStatusUpdate(populatedOrder, populatedOrder.user).catch(err =>
                    console.error('Order status email failed:', err)
                );
            }
        } catch (emailError) {
            console.error('Error preparing order status email:', emailError);
        }
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id username');
    res.json(orders);
});

// @desc    Request a return
// @route   POST /api/orders/:id/return
// @access  Private
const requestReturn = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    if (order.returnStatus !== 'None') {
        res.status(400);
        throw new Error('Return already requested');
    }

    order.returnStatus = 'Requested';
    order.returnReason = req.body.reason || 'Not specified';

    const updatedOrder = await order.save();

    if (req.io) {
        req.io.emit('order_updated', {
            orderId: updatedOrder._id,
            status: updatedOrder.status,
            isPaid: updatedOrder.isPaid,
            isDelivered: updatedOrder.isDelivered,
        });
    }

    res.json(updatedOrder);
});

export {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderStatus,
    getMyOrders,
    getOrders,
    requestReturn,
};
