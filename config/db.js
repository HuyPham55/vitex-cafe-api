const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitexCafe';
        
        // Log connection attempt (obfuscating password for safety)
        const displayURI = mongoURI.replace(/\/\/(.*):(.*)@/, '//***:***@');
        console.log(`Attempting to connect to MongoDB: ${displayURI}`);

        await mongoose.connect(mongoURI);
        
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Don't exit process in development, allow it to retry or show error
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
