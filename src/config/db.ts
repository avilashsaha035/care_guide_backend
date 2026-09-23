import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const configuredUri = process.env.MONGODB_URI;

  mongoose.set('strictQuery', true);

  if (configuredUri && configuredUri.trim() !== '') {
    try {
      console.log(`📡 Connecting to configured MongoDB: ${configuredUri.replace(/:([^:@]+)@/, ':****@')}...`);
      await mongoose.connect(configuredUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ Successfully connected to MongoDB Atlas!`);
      return;
    } catch (err: any) {
      console.warn(`⚠️ Could not connect to configured MongoDB (${configuredUri}): ${err.message}`);
      console.log('🔄 Automatically falling back to embedded In-Memory MongoDB so development continues smoothly...');
    }
  }

  // Fallback to In-Memory MongoDB if local service isn't started or no URI configured
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    const fallbackUri = mongoMemoryServer.getUri();
    await mongoose.connect(fallbackUri);
    console.log(`✅ Connected to Embedded In-Memory MongoDB at: ${fallbackUri}`);
  } catch (error: any) {
    console.error('❌ Fatal Database Startup Error:', error.message);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (error) {
    console.error('Error during database disconnect:', error);
  }
};
