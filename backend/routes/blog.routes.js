import express from 'express';
import BlogPost from '../models/blogPost.model.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await BlogPost.find({}).sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/blog
// @desc    Create a blog post
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { title, content, author, tags, imageUrl } = req.body;
        const post = new BlogPost({
            title,
            content,
            author: req.user._id,
            tags,
            imageUrl
        });
        const createdPost = await post.save();
        res.status(201).json(createdPost);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/blog/:id
// @desc    Update a blog post
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (post) {
            post.title = req.body.title || post.title;
            post.content = req.body.content || post.content;
            post.tags = req.body.tags || post.tags;
            post.imageUrl = req.body.imageUrl || post.imageUrl;
            const updatedPost = await post.save();
            res.json(updatedPost);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/blog/:id
// @desc    Delete a blog post
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (post) {
            await BlogPost.deleteOne({ _id: post._id });
            res.json({ message: 'Post removed' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
