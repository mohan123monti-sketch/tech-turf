// --- Imports ---
import express from 'express';
import Project from '../models/project.model.js'; // Import our Project model
// We will add authMiddleware here later to protect admin routes
import { protect, admin } from '../middleware/authMiddleware.js';

// --- Configuration ---
const router = express.Router();


// --- API Routes ---

/**
 * @route   GET /api/projects
 * @desc    Fetch all projects
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find({}); // Find all projects
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Admin Only)
 * @access  Private/Admin
 */
// We will add 'protect' and 'admin' as middleware later
// router.post('/', protect, admin, async (req, res) => {
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            name,
            description,
            imageUrl,
            tags,
            projectLink
        } = req.body;

        const project = new Project({
            name,
            description,
            imageUrl,
            tags,
            projectLink
        });

        const newProject = await project.save();
        res.status(201).json(newProject);

    } catch (error)
 {
        console.error("Error creating project:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Fetch a single project by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (project) {
            res.status(200).json(project);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- Export Router ---
export default router;