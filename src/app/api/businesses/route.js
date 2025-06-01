import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    const verified = searchParams.get('verified') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    // Build query - only show active businesses
    let query = { status: 'active' };

    // Search in name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filter by location (city or state)
    if (location) {
      query.$or = [
        { 'contact.address.city': { $regex: location, $options: 'i' } },
        { 'contact.address.state': { $regex: location, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by verification status
    if (verified) {
      query['verification.status'] = 'verified';
    }

    // Filter by featured status
    if (featured) {
      query.featured = true;
    }

    console.log('Business query:', query);

    const total = await Business.countDocuments(query);

    const businesses = await Business.find(query)
      .populate('owner', 'name email')
      .sort({ 
        featured: -1, // Featured first
        'verification.status': -1, // Verified next
        'stats.averageRating': -1, // Highest rated
        createdAt: -1 // Newest
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Found ${businesses.length} businesses`);

    // Transform data to match frontend expectations
    const transformedBusinesses = businesses.map(business => ({
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
      createdAt: business.createdAt,
      updatedAt: business.updatedAt
    }));

    return NextResponse.json({
      businesses: transformedBusinesses,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: businesses.length,
        totalItems: total
      },
      message: 'Businesses retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses', details: error.message },
      { status: 500 }
    );
  }
}