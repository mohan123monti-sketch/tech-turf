// --- Imports ---
import mongoose from 'mongoose';

// --- Project Schema Definition ---
// This schema defines the structure of a 'Project' document in MongoDB.
const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Project description is required'],
        },
        imageUrl: {
            type: String,
            required: false, // We can use placeholders if not provided
        },
        tags: {
            type: [String], // An array of strings, e..g, ["AI", "SaaS"]
            default: [],
        },
        projectLink: {
            // A link to the case study or the live project
            type: String,
            required: false,
            trim: true,
        },
    },
    {
        // Automatically add 'createdAt' and 'updatedAt' fields
        timestamps: true,
    }
);

// --- Model Creation ---
// Create the 'Project' model from the schema
const Project = mongoose.model('Project', projectSchema);

// --- Export ---
export default Project;