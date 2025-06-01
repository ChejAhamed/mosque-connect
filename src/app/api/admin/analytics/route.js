import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Business from '@/models/Business';
import Mosque from '@/models/Mosque';
import VolunteerProfile from '@/models/VolunteerProfile';
import VolunteerApplication from '@/models/VolunteerApplication';
import VolunteerOffer from '@/models/VolunteerOffer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Overview analytics
    const [
      totalUsers,
      totalMosques,
      totalBusinesses,
      totalVolunteers,
      activeUsers,
      pendingBusinesses,
      pendingMosques
    ] = await Promise.all([
      User.countDocuments(),
      Mosque.countDocuments(),
      Business.countDocuments(),
      VolunteerProfile.countDocuments(),
      User.countDocuments({ updatedAt: { $gte: startDate } }),
      Business.countDocuments({ 'verification.status': 'pending' }),
      Mosque.countDocuments({ status: 'pending' })
    ]);

    // Calculate growth rates (comparing with previous period)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setTime(previousPeriodStart.getTime() - (now.getTime() - startDate.getTime()));

    const [
      prevUsers,
      prevMosques,
      prevBusinesses,
      prevVolunteers
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: startDate } }),
      Mosque.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: startDate } }),
      Business.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: startDate } }),
      VolunteerProfile.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: startDate } })
    ]);

    const currentPeriod = {
      users: await User.countDocuments({ createdAt: { $gte: startDate } }),
      mosques: await Mosque.countDocuments({ createdAt: { $gte: startDate } }),
      businesses: await Business.countDocuments({ createdAt: { $gte: startDate } }),
      volunteers: await VolunteerProfile.countDocuments({ createdAt: { $gte: startDate } })
    };

    const growthRates = {
      users: prevUsers > 0 ? Math.round(((currentPeriod.users - prevUsers) / prevUsers) * 100) : 0,
      mosques: prevMosques > 0 ? Math.round(((currentPeriod.mosques - prevMosques) / prevMosques) * 100) : 0,
      businesses: prevBusinesses > 0 ? Math.round(((currentPeriod.businesses - prevBusinesses) / prevBusinesses) * 100) : 0,
      volunteers: prevVolunteers > 0 ? Math.round(((currentPeriod.volunteers - prevVolunteers) / prevVolunteers) * 100) : 0
    };

    // User analytics
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    const usersByLocation = await User.aggregate([
      { $match: { city: { $exists: true, $ne: null } } },
      { $group: { _id: { city: '$city', state: '$state' }, count: { $sum: 1 } } },
      { $project: { city: '$_id.city', state: '$_id.state', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const verificationStats = await User.aggregate([
      { $group: { _id: '$isVerified', count: { $sum: 1 } } }
    ]);

    const userVerificationStats = {
      verified: verificationStats.find(s => s._id === true)?.count || 0,
      unverified: verificationStats.find(s => s._id === false)?.count || 0
    };

    // Mosque analytics
    const mosquesByLocation = await Mosque.aggregate([
      { $match: { 'contact.address.city': { $exists: true, $ne: null } } },
      { $group: { _id: { city: '$contact.address.city', state: '$contact.address.state' }, count: { $sum: 1 } } },
      { $project: { city: '$_id.city', state: '$_id.state', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const mosqueStatusDistribution = await Mosque.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    const servicesPopularity = await Mosque.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
      { $project: { service: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Business analytics
    const businessesByCategory = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    const businessesByLocation = await Business.aggregate([
      { $match: { 'contact.address.city': { $exists: true, $ne: null } } },
      { $group: { _id: { city: '$contact.address.city', state: '$contact.address.state' }, count: { $sum: 1 } } },
      { $project: { city: '$_id.city', state: '$_id.state', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const businessStatusDistribution = await Business.aggregate([
      { $group: { _id: '$verification.status', count: { $sum: 1 } } },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    // Volunteer analytics
    let applicationsByCategory = [];
    let statusDistribution = [];
    let topMosques = [];

    try {
      applicationsByCategory = await VolunteerApplication.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { category: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ]);

      statusDistribution = await VolunteerApplication.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { status: '$_id', count: 1, _id: 0 } }
      ]);

      topMosques = await VolunteerApplication.aggregate([
        { $match: { mosqueId: { $exists: true } } },
        { $group: { _id: '$mosqueId', total: { $sum: 1 } } },
        { $lookup: { from: 'mosques', localField: '_id', foreignField: '_id', as: 'mosque' } },
        { $unwind: '$mosque' },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]);
    } catch (error) {
      console.log('Volunteer analytics error (models may not exist):', error.message);
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalMosques,
        totalBusinesses,
        totalVolunteers,
        activeUsers,
        pendingApprovals: pendingBusinesses + pendingMosques,
        growthRates
      },
      userAnalytics: {
        usersByRole,
        usersByLocation,
        registrationTrends: [],
        activeUsers,
        verificationStats: userVerificationStats
      },
      mosquesAnalytics: {
        mosquesByLocation,
        statusDistribution: mosqueStatusDistribution,
        capacityAnalysis: [],
        servicesPopularity,
        verificationStats: { verified: 0, pending: 0, rejected: 0 }
      },
      businessAnalytics: {
        businessesByCategory,
        businessesByLocation,
        statusDistribution: businessStatusDistribution,
        verificationTrends: [],
        topPerformers: []
      },
      volunteerAnalytics: {
        applicationsByCategory,
        applicationTrends: [],
        offersByCategory: [],
        topMosques,
        statusDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}