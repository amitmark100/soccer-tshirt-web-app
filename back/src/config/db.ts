import mongoose from 'mongoose';

export async function connect(): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:bartar20%40CS@localhost:21771/soccer_store?authSource=admin';

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log(`Connecting to MongoDB at ${MONGO_URI} ...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('MongoDB connection error:', errorMessage);
    process.exit(1);
  }
}