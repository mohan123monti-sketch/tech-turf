// --- Imports ---
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'; // Import our User model

// --- Configuration ---
const router = express.Router();

// --- Helper Function: Generate JWT ---
// This function creates a signed JSON Web Token
const generateToken = (id, isAdmin, role) => {
    return jwt.sign(
        { id, isAdmin, role }, // Payload
        process.env.JWT_SECRET, // Secret key from .env
        { expiresIn: '30d' } // Token expires in 30 days
    );
};


// --- API Routes ---

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        // 2. Check if user (email or username) already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // 3. Create new user
        // Password hashing is handled automatically by the pre-save hook in user.model.js
        const user = new User({
            username,
            email,
            password,
        });

        // 4. Save user to database
        const newUser = await user.save();

        // 5. Send back a successful response with a token
        res.status(201).json({ // 201 = Created
            message: 'User registered successfully',
            token: generateToken(newUser._id, newUser.isAdmin, newUser.role),
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                role: newUser.role,
            },
        });

    } catch (error) {
        console.error("Registration Error:", error);
        // Handle validation errors (e.g., password too short)
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
});


/**
 * @route   POST /api/auth/login
 * @desc    Authenticate a user and get a token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if all fields are provided
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password' });
        }

        // 2. Find user by email
        const user = await User.findOne({ email });

        // 3. Check if user exists AND password matches
        // We use the custom 'matchPassword' method we defined in the model
        if (user && (await user.matchPassword(password))) {
            // 4. Send back a successful response with a token
            res.status(200).json({
                message: 'Login successful',
                token: generateToken(user._id, user.isAdmin, user.role),
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    role: user.role,
                },
            });
        } else {
            // 4b. Send error for invalid credentials
            return res.status(401).json({ message: 'Invalid email or password' }); // 401 = Unauthorized
        }

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


// --- Export Router ---
export default router;