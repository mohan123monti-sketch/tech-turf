// --- Imports ---
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// --- User Schema Definition ---
// This schema defines the structure of a 'User' document in MongoDB.
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: [true, 'Username already exists'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: [true, 'Email already exists'],
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'superadmin', 'content_manager', 'product_manager', 'support_agent'],
            default: 'user',
        },
        googleId: {
            type: String,
            sparse: true,
        },
        facebookId: {
            type: String,
            sparse: true,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastLogin: {
            type: Date,
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false,
        },
        addresses: {
            type: [
                {
                    label: { type: String, default: 'Home' },
                    address: { type: String },
                    city: { type: String },
                    state: { type: String },
                    postalCode: { type: String },
                    country: { type: String, default: 'India' },
                    phone: { type: String },
                    company: { type: String },
                    gstin: { type: String },
                    isDefault: { type: Boolean, default: false },
                },
            ],
            default: [],
        },
        savedCart: {
            type: [
                {
                    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                    name: { type: String },
                    price: { type: Number },
                    image: { type: String },
                    qty: { type: Number, default: 1 },
                    variant: { type: Object },
                },
            ],
            default: [],
        },
        wishlist: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Product',
            default: [],
        },
        recentlyViewed: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Product',
            default: [],
        },
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields
        timestamps: true,
    }
);

// --- Mongoose Middleware (pre-save hook) ---
// This function runs *before* a new user document is saved to the database.
// Its purpose is to hash the password.
userSchema.pre('save', async function (next) {
    // 'this' refers to the user document being saved.

    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a "salt" (random string) to make the hash secure
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// --- Schema Method: matchPassword ---
// This adds a custom method to every User document.
// It allows us to compare a plaintext password with the hashed db password.
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// --- Model Creation ---
// Create the 'User' model from the schema
const User = mongoose.model('User', userSchema);

// --- Export ---
export default User;