import { connectDB } from '../lib/db.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    await connectDB();
    
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = new User({
      name: 'Admin User',
      email: 'admin@mosque.com',
      password: hashedPassword,
      role: 'admin',
      city: 'London'
    });
    
    await admin.save();
    console.log('Admin created: admin@mosque.com / admin123');
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('Admin already exists');
    } else {
      console.error('Error:', error);
    }
  }
  process.exit(0);
}

createAdmin();