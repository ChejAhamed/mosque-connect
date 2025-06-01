import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Await params before accessing properties
    const { businessId } = await params;

    // Verify business exists and is active
    const business = await Business.findById(businessId);
    if (!business || business.status !== 'active') {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;

    const now = new Date();

    // Build query - only active offers that are currently valid
    let query = {
      businessId: businessId,
      status: 'active',
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    };

    // If Offer model doesn't exist, return empty array
    let offers = [];
    try {
      const Offer = mongoose.models.Offer;
      if (Offer) {
        const total = await Offer.countDocuments(query);
        offers = await Offer.find(query)
          .sort({ featured: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return NextResponse.json({
          offers,
          pagination: {
            current: page,
            total: Math.ceil(total / limit),
            count: offers.length,
            totalItems: total
          }
        });
      }
    } catch (error) {
      console.log('Offer model not found, returning empty array');
    }

    return NextResponse.json({
      offers: [],
      pagination: {
        current: 1,
        total: 1,
        count: 0,
        totalItems: 0
      }
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}