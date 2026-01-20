// --- Imports ---
import mongoose from 'mongoose';
const { Schema } = mongoose;

// --- Submission Schema Definition ---
// This schema will store data from both the contact and estimator forms
const submissionSchema = new mongoose.Schema(
    {
        // Field to distinguish between form types
        formType: {
            type: String,
            required: true,
            enum: ['contact', 'estimator'],
        },

        // Common fields
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        
        // --- Contact Form Fields ---
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        subject: { type: String, trim: true },
        message: { type: String, trim: true },

        // --- Estimator Form Fields ---
        projectSize: { type: String, trim: true }, // e.g., "small", "medium", "large"
        features: { type: [String], default: [] }, // e.g., ["auth", "cms"]
        estimatedTotal: { type: Number },
        
        // --- Relational Data ---
        // Link to the user who submitted, if they were logged in
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User', // This links to our 'User' model
            required: false, // Allow anonymous submissions
        },

        // --- Admin Tracking ---
        status: {
            type: String,
            enum: ['new', 'read', 'contacted'],
            default: 'new',
        }
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields
        timestamps: true,
    }
);

// --- Model Creation ---
const Submission = mongoose.model('Submission', submissionSchema);

// --- Export ---
export default Submission;