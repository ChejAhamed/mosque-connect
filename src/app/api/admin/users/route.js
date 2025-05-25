import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    console.log('=== DEBUG: Users API called ===');
    
    const session = await getServerSession(authOptions);
    console.log('Full session object:', JSON.stringify(session, null, 2));
    
    if (!session) {
      console.log('ERROR: No session found');
      return NextResponse.json({ error: 'No session' }, { status: 401 });
    }

    // Check multiple possible role locations
    const userRole = session.user?.role || session.role || session.user?.userRole;
    console.log('User role found:', userRole);
    console.log('Checking role from different paths:', {
      'session.user.role': session.user?.role,
      'session.role': session.role,
      'session.user.userRole': session.user?.userRole
    });

    // If no role found, check the database directly
    if (!userRole && session.user?.email) {
      console.log('No role in session, checking database for user:', session.user.email);
      await connectDB();
      const dbUser = await User.findOne({ email: session.user.email }).select('role');
      console.log('Database user role:', dbUser?.role);
      
      if (dbUser && ['admin', 'superadmin'].includes(dbUser.role)) {
        console.log('✅ Authorization passed via database lookup');
        // Continue with the API
      } else {
        console.log('ERROR: Invalid role from database:', dbUser?.role);
        return NextResponse.json({ error: 'Unauthorized - invalid role' }, { status: 401 });
      }
    } else if (!['admin', 'superadmin'].includes(userRole)) {
      console.log('ERROR: Invalid role from session:', userRole);
      return NextResponse.json({ error: 'Unauthorized - invalid role' }, { status: 401 });
    } else {
      console.log('✅ Authorization passed via session role');
    }

    await connectDB();
    console.log('✅ Database connected');

    // Get users (excluding passwords) sorted by creation date
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json(users);

  } catch (error) {
    console.error('❌ Error in users API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + error.message },
      { status: 500 }
    );
  }
}