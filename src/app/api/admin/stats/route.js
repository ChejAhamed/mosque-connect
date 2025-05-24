import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Mosque from '@/models/Mosque';
import Business from '@/models/Business';
import Volunteer from '@/models/Volunteer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get counts for all entities and aggregated data
    const [
      totalUsers,
      totalMosques,
      totalBusinesses,
      totalVolunteers,
      mosqueStats,
      userGrowthData,
      businessByCategoryData
    ] = await Promise.all([
      User.countDocuments(),
      Mosque.countDocuments(),
      Business.countDocuments(),
      Volunteer.countDocuments(),
      Mosque.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      // User growth over last 6 months
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            users: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 }
        }
      ]),
      // Business by category
      Business.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ])
    ]);

    // Process mosque status counts
    const mosqueStatusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    mosqueStats.forEach(stat => {
      if (stat._id) {
        mosqueStatusCounts[stat._id] = stat.count;
      }
    });

    // Calculate pending approvals
    const pendingApprovals = mosqueStatusCounts.pending;

    // Process user growth data
    const userGrowth = userGrowthData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      users: item.users
    }));

    // Process business by category
    const businessByCategory = businessByCategoryData.map(item => ({
      category: item._id || 'Other',
      count: item.count
    }));

    const stats = {
      totalUsers,
      totalMosques,
      totalBusinesses,
      totalVolunteers,
      pendingApprovals,
      mosqueStats: mosqueStatusCounts,
      userGrowth,
      businessByCategory
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
