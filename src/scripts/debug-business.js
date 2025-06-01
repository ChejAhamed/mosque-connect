import mongoose from 'mongoose';
import Business from '../src/models/Business.js';
import User from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mosqueconnect';

async function debugBusiness() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'b@gmail.com';
    
    // Check user
    const user = await User.findOne({ email });
    console.log('User found:', user);

    // Check all businesses
    const allBusinesses = await Business.find({});
    console.log('All businesses:', allBusinesses.length);
    allBusinesses.forEach(business => {
      console.log(`- Business: ${business.businessName}, Email: ${business.email}, UserID: ${business.userId}`);
    });

    // Look for business by email
    const businessByEmail = await Business.findOne({ email });
    console.log('Business by email:', businessByEmail);

    // Look for business by userId
    if (user) {
      const businessByUserId = await Business.findOne({ userId: user._id });
      console.log('Business by userId:', businessByUserId);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugBusiness();