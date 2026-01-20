// --- Imports ---
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * --- Protect Middleware ---
 * This function protects routes that require a user to be logged in.
 * It gets the token from the 'Authorization' header.
 */
const protect = async (req, res, next) => {
    let token;
    
    // The token is expected to be in the format: 'Bearer [token]'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get user from the token's ID and attach it to the request object
            // We exclude the password when fetching the user
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // 4. Move on to the next function (the actual route)
            next();

        } catch (error) {
            console.error('Token verification failed:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

/**
 * --- Admin Middleware ---
 * This function protects routes that can *only* be accessed by an admin.
 * It *must* be used *after* the 'protect' middleware.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // User is an admin, proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' }); // 403 = Forbidden
    }
};

// --- Export ---
export { protect, admin };