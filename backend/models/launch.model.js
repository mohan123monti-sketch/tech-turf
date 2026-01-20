import mongoose from 'mongoose';

const launchSchema = new mongoose.Schema({
    missionName: {
        type: String,
        required: true
    },
    rocketName: {
        type: String,
        required: true
    },
    launchDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['scheduled', 'go_for_launch', 'launched', 'aborted', 'failed', 'success'],
        default: 'scheduled'
    },
    missionSummary: {
        type: String
    },
    telemetryData: {
        type: String // URL to secure storage or sanitized JSON string
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Launch = mongoose.model('Launch', launchSchema);
export default Launch;
