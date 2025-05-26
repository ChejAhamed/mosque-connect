import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';

    if (type === 'stats') {
      const totalVolunteers = await User.countDocuments({ volunteerStatus: { $ne: 'not_volunteer' } });
      const activeVolunteers = await User.countDocuments({ volunteerStatus: 'active' });
      const pendingVolunteers = await User.countDocuments({ volunteerStatus: 'pending' });

      return NextResponse.json({
        data: {
          stats: {
            applications: {
              total: totalVolunteers,
              pending: pendingVolunteers,
              accepted: activeVolunteers,
              rejected: 0
            },
            offers: {
              total: activeVolunteers,
              active: activeVolunteers,
              inactive: 0
            },
            topMosques: []
          }
        }
      });
    }

    if (type === 'applications') {
      const volunteers = await User.find({ volunteerStatus: { $ne: 'not_volunteer' } })
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return NextResponse.json({
        data: {
          applications: volunteers.map(user => ({
            _id: user._id,
            userId: { name: user.name, email: user.email, city: user.city },
            mosqueId: { name: 'General Application', city: user.city },
            title: 'Volunteer Application',
            category: 'general',
            status: user.volunteerStatus === 'active' ? 'accepted' : 'pending',
            createdAt: user.createdAt
          }))
        }
      });
    }

    return NextResponse.json({ data: { applications: [], offers: [] } });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch volunteer data' }, { status: 500 });
  }
}