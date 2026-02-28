import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: false },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
        },
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String },
        company: { type: String },
        gstin: { type: String },
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0,
    },
    promoCode: {
        type: String,
    },
    discountAmount: {
        type: Number,
        default: 0.0,
    },
    deliverySlot: {
        type: String,
    },
    orderNotes: {
        type: String,
    },
    giftMessage: {
        type: String,
    },
    trackingNumber: {
        type: String,
    },
    trackingUrl: {
        type: String,
    },
    carrier: {
        type: String,
    },
    returnStatus: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Rejected', 'Refunded'],
        default: 'None',
    },
    returnReason: {
        type: String,
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    paidAt: {
        type: Date,
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false,
    },
    deliveredAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    partialPaid: {
        type: Boolean,
        default: false,
    },
    prepaidAmount: {
        type: Number,
        default: 0,
    },
    remainingPayment: {
        type: Number,
        default: 0,
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Partially Paid', 'Fully Paid'],
        default: 'Unpaid',
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
