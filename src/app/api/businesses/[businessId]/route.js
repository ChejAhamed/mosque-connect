import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { businessId } = await params;

    const business = await Business.findById(businessId)
      .populate('owner', 'name email')
      .lean();

    if (!business || business.status !== 'active') {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Transform data
    const transformedBusiness = {
      id: business._id,
      name: business.name,
      description: business.description,
      category: business.category,
      address: business.contact?.address?.street || '',
      city: business.contact?.address?.city || '',
      state: business.contact?.address?.state || '',
      country: business.contact?.address?.country || 'USA',
      postalCode: business.contact?.address?.zipCode || '',
      phone: business.contact?.phone || '',
      email: business.contact?.email || '',
      website: business.contact?.website || '',
      isVerified: business.verification?.status === 'verified',
      isFeatured: business.featured || false,
      rating: business.stats?.averageRating || 0,
      reviewCount: business.stats?.totalReviews || 0,
      images: business.images || {},
      hours: business.hours || {},
      tags: business.tags || [],
      owner: business.owner
    };

    return NextResponse.json({
      business: transformedBusiness,
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