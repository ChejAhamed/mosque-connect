import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check for both admin and superadmin roles
    if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user counts by role
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize stats object
    const stats = {
      total: 0,
      superadmin: 0,
      admin: 0,
      imam: 0,
      business: 0,
      volunteer: 0,
      user: 0
    };

    // Process the aggregation results
    userStats.forEach(stat => {
      const role = stat._id || 'user';
      if (stats.hasOwnProperty(role)) {
        stats[role] = stat.count;
      } else {
        stats.user += stat.count; // Put unknown roles in 'user'
      }
      stats.total += stat.count;
    });

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}