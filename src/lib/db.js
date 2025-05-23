import mongoose from 'mongoose';

// Global variable to cache the database connection
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return { db: cachedDb, mongoose };
  }

  // Use MongoDB connection string from environment variables
  // Check for both DATABASE_URI (primary) and MONGODB_URI (fallback) for compatibility
  const dbUri = process.env.DATABASE_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/mosque-connect';

  if (!dbUri) {
    throw new Error('Please define the DATABASE_URI environment variable');
  }

  try {
    const conn = await mongoose.connect(dbUri);
    cachedDb = conn.connection;

    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.log('MongoDB connection error: ', err);
    });

    return { db: cachedDb, mongoose };
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    // Instead of throwing error, return a flag indicating connection failed
    // This allows the application to continue running even if DB connection fails
    return { error: true, message: error.message };
  }
}

// Export connectToDatabase as both named and default export
const dbConnect = connectToDatabase;
export default dbConnect;
