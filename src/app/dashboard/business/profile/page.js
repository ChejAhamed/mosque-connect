import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import User from '@/models/User';

export async function GET() {
  try {
    console.log('=== Fetching business profile ===');
    const session = await getServerSession(authOptions);
    console.log('Session in API:', JSON.stringify(session, null, 2));

    if (!session || !session.user) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    console.log('User ID:', session.user.id);
    console.log('User role from session:', session.user.role);

    // If role is missing from session, get it from database
    let userRole = session.user.role;
    let userId = session.user.id;
    
    if (!userRole || !userId) {
      console.log('Missing role or ID, fetching from database...');
      await connectDB();
      
      // Try to find user by email if ID is missing
      const userQuery = userId ? { _id: userId } : { email: session.user.email };
      console.log('User query:', userQuery);
      
      const user = await User.findOne(userQuery);
      console.log('User from database:', user);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }
      
      userRole = user.role;
      userId = user._id.toString();
      console.log('Role from database:', userRole);
      console.log('ID from database:', userId);
    }

    if (userRole !== 'business') {
      console.log(`❌ User role is "${userRole}", not "business"`);
      return NextResponse.json({ 
        error: 'Unauthorized - Not a business user',
        userRole: userRole,
        userId: userId
      }, { status: 403 });
    }

    await connectDB();

    // Find business owned by the user
    console.log('Looking for business with owner ID:', userId);
    const business = await Business.findOne({ owner: userId })
      .populate('owner', 'name email')
      .lean();

    console.log('Business found:', !!business);

    if (!business) {
      console.log('❌ No business found for user');
      return NextResponse.json({ 
        error: 'Business not found',
        userId: userId,
        userRole: userRole
      }, { status: 404 });
    }

    console.log('✅ Business profile retrieved successfully');
    return NextResponse.json({
      business,
      message: 'Business profile retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business profile', details: error.message },
      { status: 500 }
    );
  }
}