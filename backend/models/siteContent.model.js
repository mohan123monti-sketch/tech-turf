import mongoose from 'mongoose';

const siteContentSchema = mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true,
        enum: ['home', 'about', 'contact', 'footer', 'header']
    },
    sections: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

export default SiteContent;
