import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/soccer_store';

export async function connect(): Promise<void> {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI} ...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection error:', errorMessage);
    console.error(
      'Hint: make sure MongoDB is running locally or set the MONGO_URI environment variable to a valid MongoDB URI.'
    );
    process.exit(1);
  }
}
