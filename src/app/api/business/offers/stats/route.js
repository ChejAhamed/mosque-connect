import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Offer from '@/models/Offer';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const now = new Date();

    // Get comprehensive offer statistics
    const [
      totalOffers,
      activeOffers,
      expiredOffers,
      featuredOffers,
      draftOffers,
      totalUsage,
      offerPerformance,
      recentOffers
    ] = await Promise.all([
      // Total offers
      Offer.countDocuments({ businessId: business._id }),
      
      // Active offers
      Offer.countDocuments({ 
        businessId: business._id,
        status: 'active',
        validFrom: { $lte: now },
        validTo: { $gte: now }
      }),
      
      // Expired offers
      Offer.countDocuments({ 
        businessId: business._id,
        validTo: { $lt: now }
      }),
      
      // Featured offers
      Offer.countDocuments({ 
        businessId: business._id,
        featured: true
      }),
      
      // Draft offers
      Offer.countDocuments({ 
        businessId: business._id,
        status: 'draft'
      }),
      
      // Total usage across all offers
      Offer.aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: '$usedCount' }
          }
        }
      ]),
      
      // Offer performance by type
      Offer.aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: '$discountType',
            count: { $sum: 1 },
            totalUsage: { $sum: '$usedCount' },
            averageDiscount: { $avg: '$discountValue' }
          }
        },
        { $sort: { totalUsage: -1 } }
      ]),
      
      // Recent offers (last 5)
      Offer.find({ businessId: business._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status usedCount createdAt')
        .lean()
    ]);

    // Get top performing offers
    const topOffers = await Offer.find({ businessId: business._id })
      .sort({ usedCount: -1 })
      .limit(5)
      .select('title usedCount usageLimit discountType discountValue')
      .lean();

    // Get offers expiring soon (next 7 days)
    const soonExpiring = await Offer.find({
      businessId: business._id,
      status: 'active',
      validTo: {
        $gte: now,
        $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    .select('title validTo usedCount')
    .sort({ validTo: 1 })
    .lean();

    // Calculate monthly offer creation trend
    const monthlyCreation = await Offer.aggregate([
      {
        $match: {
          businessId: business._id,
          createdAt: {
            $gte: new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalUsage: { $sum: '$usedCount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = {
      total: totalOffers,
      active: activeOffers,
      expired: expiredOffers,
      featured: featuredOffers,
      draft: draftOffers,
      totalUsage: totalUsage.length > 0 ? totalUsage[0].totalUsage : 0,
      offerPerformance,
      topOffers,
      recentOffers,
      soonExpiring,
      monthlyCreation
    };

    return NextResponse.json({
      stats,
      message: 'Offer statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching offer stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer statistics' },
      { status: 500 }
    );
  }
}