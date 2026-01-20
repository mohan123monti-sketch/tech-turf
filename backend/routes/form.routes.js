// --- Imports ---
import express from 'express';
import Submission from '../models/submission.model.js'; // Import our Submission model
// We will add authMiddleware later to get req.user if they are logged in
import { protect, admin } from '../middleware/authMiddleware.js'; // <-- ADD THIS LINE

// --- Configuration ---
const router = express.Router();

// --- API Routes ---

/**
 * @route   POST /api/forms/submit
 * @desc    Submit data from contact or estimator form
 * @access  Public (but will check for user)
 */
// We'll add 'protect' (as optional) later. For now, it's public.
router.post('/submit', async (req, res) => {
    try {
        const {
            formType, // 'contact' or 'estimator'
            email,
            firstName,
            lastName,
            subject,
            message,
            projectSize,
            features,
            estimatedTotal
        } = req.body;

        // Basic validation
        if (!formType || !email) {
            return res.status(400).json({ message: 'Form type and email are required.' });
        }
        
        // Create new submission object
        const newSubmission = new Submission({
            formType,
            email,
            firstName,
            lastName,
            subject,
            message,
            projectSize,
            features,
            estimatedTotal,
            // author: req.user ? req.user.id : null // We'll add this in Phase 3
        });
        
        // Save to database
        await newSubmission.save();
        
        res.status(201).json({ 
            message: `Form (${formType}) submitted successfully!`,
            submission: newSubmission 
        });

    } catch (error) {
        console.error("Form submission error:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});


/**
 * @route   GET /api/forms
 * @desc    Get all form submissions (Admin Only)
 * @access  Private/Admin
 */
// We will add 'protect' and 'admin' as middleware later
// router.get('/', protect, admin, async (req, res) => {
router.get('/', protect, admin, async (req, res) => { // <-- ADDED MIDDLEWARE
    try {
        const submissions = await Submission.find({})
            .populate('author', 'username email') // Show author's username/email
            .sort({ createdAt: -1 }); // Show newest first
            
        res.status(200).json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Export Router ---
export default router;