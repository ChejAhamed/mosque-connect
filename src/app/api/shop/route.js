import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'featured';

    // Build query - only active and verified businesses
    let query = { 
      status: 'active',
      'verification.status': { $in: ['verified', 'pending'] } // Allow pending for now
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (city && city !== 'all') {
      query['contact.address.city'] = city;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'featured':
        sortObject = { featured: -1, 'stats.views': -1, createdAt: -1 };
        break;
      case 'name':
        sortObject = { name: 1 };
        break;
      case 'rating':
        sortObject = { 'stats.averageRating': -1, 'stats.totalReviews': -1 };
        break;
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'popular':
        sortObject = { 'stats.views': -1, 'stats.totalProducts': -1 };
        break;
      default:
        sortObject = { featured: -1, createdAt: -1 };
    }

    // Get total count
    const total = await Business.countDocuments(query);

    // Get businesses with pagination
    const businesses = await Business.find(query)
      .select('-owner') // Remove sensitive owner information
      .sort(sortObject)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      businesses,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: businesses.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}