import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Business from '@/models/Business';
import VolunteerProfile from '@/models/VolunteerProfile';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get statistics
    const [
      totalUsers,
      totalBusinesses,
      totalVolunteers,
      pendingBusinesses,
      pendingVolunteers
    ] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      VolunteerProfile.countDocuments(),
      Business.countDocuments({ 'verification.status': 'pending' }),
      VolunteerProfile.countDocuments({ status: 'pending' })
    ]);

    // Get recent users (last 10)
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt')
      .lean();

    // Get recent businesses (last 10)
    const recentBusinesses = await Business.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name category verification createdAt')
      .lean();

    // Get pending approvals
    const [pendingBusinessApprovals, pendingVolunteerApprovals] = await Promise.all([
      Business.find({ 'verification.status': 'pending' })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      VolunteerProfile.find({ status: 'pending' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    // Format pending approvals
    const pendingApprovals = [
      ...pendingBusinessApprovals.map(business => ({
        _id: business._id,
        type: 'business',
        name: business.name,
        email: business.owner?.email || business.contact?.email,
        createdAt: business.createdAt
      })),
      ...pendingVolunteerApprovals.map(volunteer => ({
        _id: volunteer._id,
        type: 'volunteer',
        name: volunteer.userId?.name || 'Unknown',
        email: volunteer.userId?.email || 'Unknown',
        createdAt: volunteer.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalBusinesses,
        totalVolunteers,
        pendingBusinesses,
        pendingVolunteers
      },
      recentUsers,
      recentBusinesses,
      pendingApprovals
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}