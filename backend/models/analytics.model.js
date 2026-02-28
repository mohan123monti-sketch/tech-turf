import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['pageview', 'click', 'purchase', 'signup', 'search', 'cart_add'],
        required: true
    },
    page: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sessionId: String,
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
analyticsSchema.index({ type: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
