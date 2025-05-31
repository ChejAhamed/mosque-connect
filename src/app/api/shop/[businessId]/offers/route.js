import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Offer from '@/models/Offer';

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Verify business exists and is active
    const business = await Business.findById(params.businessId);
    if (!business || business.status !== 'active') {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit')) || 10;

    const now = new Date();

    // Build query - only active offers that are currently valid
    let query = { 
      businessId: params.businessId,
      status: 'active',
      validFrom: { $lte: now },
      validTo: { $gte: now }
    };

    if (featured === 'true') {
      query.featured = true;
    }

    // Filter out offers that have reached their usage limit
    const offers = await Offer.aggregate([
      { $match: query },
      {
        $match: {
          $or: [
            { usageLimit: { $exists: false } },
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
          ]
        }
      },
      {
        $addFields: {
          daysRemaining: {
            $ceil: {
              $divide: [
                { $subtract: ['$validTo', now] },
                1000 * 60 * 60 * 24
              ]
            }
          },
          usagePercentage: {
            $cond: [
              { $and: [{ $ne: ['$usageLimit', null] }, { $gt: ['$usageLimit', 0] }] },
              { $multiply: [{ $divide: ['$usedCount', '$usageLimit'] }, 100] },
              0
            ]
          }
        }
      },
      { $sort: { featured: -1, priority: -1, createdAt: -1 } },
      { $limit: limit }
    ]);

    return NextResponse.json({
      offers,
      message: 'Offers retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}