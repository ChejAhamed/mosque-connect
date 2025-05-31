import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
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
    const type = searchParams.get('type') || 'profiles';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    if (type === 'stats') {
      // Get volunteer statistics
      const [
        totalApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications,
        totalOffers,
        activeOffers,
        inactiveOffers
      ] = await Promise.all([
        VolunteerApplication.countDocuments(),
        VolunteerApplication.countDocuments({ status: 'pending' }),
        VolunteerApplication.countDocuments({ status: 'accepted' }),
        VolunteerApplication.countDocuments({ status: 'rejected' }),
        VolunteerOffer.countDocuments(),
        VolunteerOffer.countDocuments({ status: 'active' }),
        VolunteerOffer.countDocuments({ status: 'inactive' })
      ]);

      // Get top mosques by applications
      const topMosques = await VolunteerApplication.aggregate([
        { $match: { mosqueId: { $exists: true } } },
        { $group: { _id: '$mosqueId', total: { $sum: 1 } } },
        { $lookup: { from: 'mosques', localField: '_id', foreignField: '_id', as: 'mosque' } },
        { $unwind: '$mosque' },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]);

      return NextResponse.json({
        data: {
          stats: {
            applications: {
              total: totalApplications,
              pending: pendingApplications,
              accepted: acceptedApplications,
              rejected: rejectedApplications
            },
            offers: {
              total: totalOffers,
              active: activeOffers,
              inactive: inactiveOffers
            },
            topMosques
          }
        }
      });
    }

    if (type === 'applications') {
      const applications = await VolunteerApplication.find()
        .populate('userId', 'name email')
        .populate('mosqueId', 'name address')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        data: { applications }
      });
    }

    if (type === 'offers') {
      const offers = await VolunteerOffer.find()
        .populate('userId', 'name email city')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        data: { offers }
      });
    }

    // Default: return volunteer profiles
    const volunteers = await VolunteerProfile.find()
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      volunteers,
      pagination: {
        current: page,
        total: Math.ceil(volunteers.length / limit),
        count: volunteers.length,
        totalItems: volunteers.length
      }
    });

  } catch (error) {
    console.error('Error fetching volunteer data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer data' },
      { status: 500 }
    );
  }
}