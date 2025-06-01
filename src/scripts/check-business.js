import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Business from '../src/models/Business.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mosqueconnect';

async function checkBusinessData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users with business role
    const businessUsers = await User.find({ role: 'business' }).lean();
    console.log('Business users found:', businessUsers.length);
    businessUsers.forEach(user => {
      console.log(`- User: ${user.email}, ID: ${user._id}, Role: ${user.role}`);
    });

    // Find all businesses
    const businesses = await Business.find({}).lean();
    console.log('\nBusinesses found:', businesses.length);
    businesses.forEach(business => {
      console.log(`- Business: ${business.businessName}, Email: ${business.email}, UserID: ${business.userId}`);
    });

    // Check for mismatches
    console.log('\n=== Checking for email mismatches ===');
    for (const user of businessUsers) {
      const business = await Business.findOne({ email: user.email });
      if (!business) {
        console.log(`❌ User ${user.email} has no matching business profile`);
      } else {
        console.log(`✅ User ${user.email} has matching business profile`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkBusinessData();