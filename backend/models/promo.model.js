import mongoose from 'mongoose';

const promoSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['percent', 'flat'],
        default: 'percent',
    },
    value: {
        type: Number,
        required: true,
        min: 0,
    },
    minOrderValue: {
        type: Number,
        default: 0,
    },
    maxDiscount: {
        type: Number,
        default: 0,
    },
    active: {
        type: Boolean,
        default: true,
    },
    startsAt: {
        type: Date,
    },
    endsAt: {
        type: Date,
    },
}, { timestamps: true });

const Promo = mongoose.model('Promo', promoSchema);

export default Promo;
