// --- Imports ---
import mongoose from 'mongoose';
const { Schema } = mongoose;

// --- Chat Message Schema Definition ---
// This schema defines the structure for a single chat message
const chatMessageSchema = new mongoose.Schema(
    {
        // Link to the user who this conversation belongs to
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User', // This links to our 'User' model
            required: [true, 'A user ID is required for chat messages'],
        },

        // Role of the message sender
        role: {
            type: String,
            required: true,
            enum: ['user', 'model'], // Only allow "user" or "model"
        },

        // The text content of the message
        text: {
            type: String,
            required: [true, 'Message text is required'],
            trim: true,
        },

        // --- Model-Specific Fields ---
        // Array to store citation sources (for 'model' roles)
        sources: [
            {
                uri: { type: String, trim: true },
                title: { type: String, trim: true },
            },
        ],
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields
        // 'createdAt' is perfect for sorting messages in order
        timestamps: true,
    }
);

// --- Model Creation ---
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// --- Export ---
export default ChatMessage;