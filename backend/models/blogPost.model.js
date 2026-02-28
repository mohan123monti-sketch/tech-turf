import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    imageUrl: {
        type: String
    },
    imageUrls: [{
        type: String
    }],
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
        default: 'published'
    },
    tags: [{
        type: String
    }],
    featuredImage: {
        type: String
    },
    publishedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
