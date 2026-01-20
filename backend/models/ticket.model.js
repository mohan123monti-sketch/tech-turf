import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Support agent
    },
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
