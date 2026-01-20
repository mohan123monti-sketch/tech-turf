import express from 'express';
import Ticket from '../models/ticket.model.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/tickets
// @desc    Create a support ticket
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { subject, description, priority } = req.body;
        const ticket = new Ticket({
            user: req.user._id,
            subject,
            description,
            priority
        });
        const createdTicket = await ticket.save();

        // Emit socket event for admins
        if (req.io) {
            req.io.emit('new_ticket', { ticketId: createdTicket._id, subject: createdTicket.subject });
        }

        res.status(201).json(createdTicket);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/tickets
// @desc    Get all tickets (Admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const tickets = await Ticket.find({}).populate('user', 'username email').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/tickets/my
// @desc    Get user's tickets
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/tickets/:id
// @desc    Update ticket status (Admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { status, response } = req.body;
        const ticket = await Ticket.findById(req.params.id);

        if (ticket) {
            ticket.status = status || ticket.status;
            const updatedTicket = await ticket.save();
            res.json(updatedTicket);
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/tickets/:id
// @desc    Delete ticket (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (ticket) {
            await Ticket.deleteOne({ _id: ticket._id });
            res.json({ message: 'Ticket removed' });
        } else {
            res.status(404).json({ message: 'Ticket not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
