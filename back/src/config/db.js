const mongoose = require('mongoose');

// Use explicit 127.0.0.1 default and a short serverSelectionTimeout for faster feedback in dev.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soccer_store';

async function connect() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI} ...`);
    // serverSelectionTimeoutMS keeps connection attempts short when the DB is unreachable.
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    console.error('Hint: make sure MongoDB is running locally or set the MONGO_URI environment variable to a valid MongoDB URI.');
    // Exit: the app depends on a working DB connection.
    process.exit(1);
  }
}

module.exports = { connect };
