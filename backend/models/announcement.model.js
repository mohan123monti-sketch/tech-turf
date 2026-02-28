import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'error', 'promo'],
        default: 'info'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    link: {
        type: String,
        trim: true
    },
    linkText: {
        type: String,
        trim: true,
        default: 'Learn More'
    },
    priority: {
        type: Number,
        default: 0
    },
    showOnPages: [{
        type: String,
        default: ['all']
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
