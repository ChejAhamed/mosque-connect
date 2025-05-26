import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const activeVolunteers = await User.countDocuments({ volunteerStatus: 'active' });
    const pendingVolunteers = await User.countDocuments({ volunteerStatus: 'pending' });

    return NextResponse.json({
      total: totalUsers,
      activeVolunteers,
      pendingVolunteers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item._id || 'user'] = item.count;
        return acc;
      }, {})
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 });
  }
}