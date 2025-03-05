const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    trainId: { type: String, required: true },
    wasOnTime: { type: Boolean, required: true },
    scheduledTime: { type: String, required: true },
    actualTime: String,
    timestamp: { type: Date, default: Date.now },
    station: { type: String, required: true },
    deviceId: String,
    timeDifference: Number
});

module.exports = mongoose.model('Feedback', feedbackSchema);