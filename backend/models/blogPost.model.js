import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    tags: [{
        type: String
    }],
    featuredImage: {
        type: String
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
