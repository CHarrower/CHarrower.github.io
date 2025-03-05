require('dotenv').config();

module.exports = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/subway_feedback',
    PORT: process.env.PORT || 3001
};