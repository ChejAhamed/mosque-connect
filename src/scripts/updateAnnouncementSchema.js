import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';

async function updateAnnouncementSchema() {
  try {
    await connectDB();
    
    // Drop the existing collection validation to allow the new schema
    await mongoose.connection.db.runCommand({
      collMod: 'announcements',
      validator: {},
      validationLevel: 'off'
    });
    
    console.log('Announcement schema validation updated successfully');
    
    // Update any existing announcements that might have invalid data
    const result = await mongoose.connection.db.collection('announcements').updateMany(
      { businessId: { $exists: false } },
      { $set: { businessId: null } }
    );
    
    console.log(`Updated ${result.modifiedCount} announcements`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateAnnouncementSchema();