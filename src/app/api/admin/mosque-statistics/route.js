import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Mosque from '@/models/Mosque';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can access this endpoint.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get overall statistics
    const totalCount = await Mosque.countDocuments();
    const pendingCount = await Mosque.countDocuments({ status: 'pending' });
    const approvedCount = await Mosque.countDocuments({ status: 'approved' });
    const rejectedCount = await Mosque.countDocuments({ status: 'rejected' });

    // Get mosque statistics by city
    const citiesAggregation = await Mosque.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, city: '$_id', count: 1 } }
    ]);

    // Get mosque statistics by features
    const featuresAggregation = await Mosque.aggregate([
      { $unwind: '$facilityFeatures' },
      { $group: { _id: '$facilityFeatures', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, feature: '$_id', count: 1 } }
    ]);

    // Get monthly registration statistics for the past year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthlyRegistrations = await Mosque.aggregate([
      { $match: { createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $let: {
              vars: {
                monthsInString: [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
              },
              in: {
                $arrayElemAt: ['$$monthsInString', { $subtract: ['$_id.month', 1] }]
              }
            }
          },
          count: 1,
          approved: 1
        }
      }
    ]);

    // Get recent mosque activity (registrations, approvals, rejections)
    const recentMosques = await Mosque.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = recentMosques.map(mosque => {
      let activityType = 'registration';
      let title = 'New Mosque Registered';
      let description = `${mosque.name} in ${mosque.city} has been registered`;

      if (mosque.status === 'approved' && mosque.verifiedAt) {
        activityType = 'approval';
        title = 'Mosque Approved';
        description = `${mosque.name} in ${mosque.city} has been approved`;
      } else if (mosque.status === 'rejected' && mosque.verifiedAt) {
        activityType = 'rejection';
        title = 'Mosque Rejected';
        description = `${mosque.name} in ${mosque.city} has been rejected`;
      }

      const date = new Date(mosque.updatedAt || mosque.createdAt);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      let formattedDate;
      if (diffInHours < 24) {
        formattedDate = `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        formattedDate = `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      }

      return {
        type: activityType,
        title,
        description,
        date: formattedDate
      };
    });

    // Fill in missing months for the monthly statistics
    const filledMonthlyData = fillMissingMonths(monthlyRegistrations);

    return NextResponse.json({
      overview: {
        total: totalCount,
        byStatus: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount
        }
      },
      byCity: citiesAggregation,
      byFeatures: featuresAggregation,
      recentActivity,
      byMonth: filledMonthlyData
    });
  } catch (error) {
    console.error('Error fetching mosque statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mosque statistics' },
      { status: 500 }
    );
  }
}

// Helper function to fill in missing months in the monthly data
function fillMissingMonths(monthlyData) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  const result = [];

  // Start from current month last year
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth + i + 1) % 12;
    const month = months[monthIndex];

    // Find existing data for this month
    const existingData = monthlyData.find(item => item.month === month);

    if (existingData) {
      result.push(existingData);
    } else {
      // Add placeholder data if no data exists
      result.push({
        month,
        count: 0,
        approved: 0
      });
    }
  }

  return result;
}
