import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Verify business exists and is active
    const business = await Business.findById(params.businessId);
    if (!business || business.status !== 'active') {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const sort = searchParams.get('sort') || 'featured';

    // Build query - only active products
    let query = { 
      businessId: params.businessId,
      status: 'active',
      'availability.online': true
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'featured':
        sortObject = { featured: -1, createdAt: -1 };
        break;
      case 'price_low':
        sortObject = { price: 1 };
        break;
      case 'price_high':
        sortObject = { price: -1 };
        break;
      case 'name':
        sortObject = { name: 1 };
        break;
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'popular':
        sortObject = { 'stats.views': -1, 'stats.orders': -1 };
        break;
      default:
        sortObject = { featured: -1, createdAt: -1 };
    }

    // Get total count
    const total = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort(sortObject)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: products.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}