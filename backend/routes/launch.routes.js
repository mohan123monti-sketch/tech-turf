import express from 'express';
import Launch from '../models/launch.model.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/launches
// @desc    Get all launches
// @access  Public
router.get('/', async (req, res) => {
    try {
        const launches = await Launch.find({}).sort({ launchDate: 1 });
        res.json(launches);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/launches
// @desc    Create a launch
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const launch = new Launch(req.body);
        const createdLaunch = await launch.save();
        res.status(201).json(createdLaunch);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/launches/:id
// @desc    Update a launch
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const launch = await Launch.findById(req.params.id);
        if (launch) {
            Object.assign(launch, req.body);
            const updatedLaunch = await launch.save();
            res.json(updatedLaunch);
        } else {
            res.status(404).json({ message: 'Launch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/launches/:id
// @desc    Delete a launch
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const launch = await Launch.findById(req.params.id);
        if (launch) {
            await Launch.deleteOne({ _id: launch._id });
            res.json({ message: 'Launch removed' });
        } else {
            res.status(404).json({ message: 'Launch not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
