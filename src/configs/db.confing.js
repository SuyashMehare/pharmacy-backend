const mongoose = require('mongoose');
const logger = require('../utils/logger'); 

async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pharmacyDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;