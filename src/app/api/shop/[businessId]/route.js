import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Find business by ID and increment view count
    const business = await Business.findByIdAndUpdate(
      params.businessId,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    )
    .populate('owner', 'name email')
    .lean();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Only return active businesses
    if (business.status !== 'active') {
      return NextResponse.json({ error: 'Business not available' }, { status: 404 });
    }

    // Remove sensitive information
    const publicBusiness = {
      ...business,
      owner: {
        name: business.owner?.name || 'Business Owner'
      }
    };

    return NextResponse.json({
      business: publicBusiness,
      message: 'Business retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}