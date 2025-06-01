import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Await params before accessing properties
    const { businessId } = await params;

    // Find business by ID and increment view count
    const business = await Business.findByIdAndUpdate(
      businessId,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    )
      .populate('owner', 'name email')
      .lean();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    if (business.status !== 'active') {
      return NextResponse.json({ error: 'Business is not active' }, { status: 404 });
    }

    return NextResponse.json({
      business,
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