// --- Imports ---
import express from 'express';
import User from '../models/user.model.js'; // Import our User model
import { protect, admin } from '../middleware/authMiddleware.js'; // Import security

// --- Configuration ---
const router = express.Router();


// --- API Routes ---

/**
 * @route   GET /api/users/profile
 * @desc    Get the logged-in user's profile
 * @access  Private (Requires login)
 */
router.get('/profile', protect, async (req, res) => {
    // The 'protect' middleware already fetched the user and attached it to req.user
    // req.user contains the user's data (minus the password)

    // We've already found the user in the middleware, so we can just send it.
    if (req.user) {
        res.status(200).json(req.user);
    } else {
        // This should theoretically not be hit if 'protect' works, but it's good practice
        res.status(404).json({ message: 'User not found' });
    }
});


/**
 * @route   PUT /api/users/profile
 * @desc    Update the logged-in user's profile
 * @access  Private (Requires login)
 */
router.put('/profile', protect, async (req, res) => {
    try {
        // Get the user from the database again, just to be safe
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get new data from the request body
        const { username, email } = req.body;

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Check if username is being changed and if it's already taken
        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });
            if (usernameExists) {
                return res.status(400).json({ message: 'Username already taken' });
            }
            user.username = username;
        }

        // Save the updated user
        const updatedUser = await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
            },
        });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: 'Server error during profile update' });
    }
});


/**
 * @route   PUT /api/users/password
 * @desc    Update the logged-in user's password
 * @access  Private (Requires login)
 */
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide current and new password' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters' });
        }

        // We must fetch the user *with* their password, so we can't use req.user
        const user = await User.findById(req.user.id);

        // Check if current password is correct
        if (await user.matchPassword(currentPassword)) {
            // It matches. Now, set the new password.
            // The pre-save hook in user.model.js will automatically hash it.
            user.password = newPassword;
            await user.save();

            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Invalid current password' });
        }

    } catch (error) {
        console.error("Password update error:", error);
        res.status(500).json({ message: 'Server error during password update' });
    }
});


/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.put('/:id/role', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.role = req.body.role || user.role;
            user.isAdmin = ['admin', 'superadmin'].includes(req.body.role);
            const updatedUser = await user.save();
            res.json({ id: updatedUser._id, role: updatedUser.role });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Export Router ---
export default router;