const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const { Parser } = require('json2csv');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(config.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schema for feedback
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

const Feedback = mongoose.model('Feedback', feedbackSchema);

// API Routes
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/export-feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ timestamp: -1 });
        const fields = ['trainId', 'wasOnTime', 'scheduledTime', 'actualTime', 'timestamp', 'station', 'deviceId', 'timeDifference'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(feedback);

        res.header('Content-Type', 'text/csv');
        res.attachment('feedback.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/feedback', async (req, res) => {
    try {
        const feedback = new Feedback(req.body);
        await feedback.save();
        res.status(201).json(feedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
});