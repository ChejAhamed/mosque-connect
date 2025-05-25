import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check for both admin and superadmin roles
    if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const { role } = await request.json();

    // Validate role
    const validRoles = ['user', 'volunteer', 'business', 'imam', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await connectDB();

    // Get current user to check permissions
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extra security: Only superadmins can modify other superadmins
    if (currentUser.role === 'superadmin' && session.user.role !== 'superadmin') {
      return NextResponse.json({ 
        error: 'Only superadmins can modify superadmin users' 
      }, { status: 403 });
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    ).select('-password');

    return NextResponse.json({ 
      message: 'User role updated successfully',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}