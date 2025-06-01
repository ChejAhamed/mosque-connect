import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product'; // If you have this model

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
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    // Build query - only active products
    let query = {
      businessId: businessId,
      status: 'active'
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { rating: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      default: sortOption = { name: 1 };
    }

    // If Product model doesn't exist, return empty array
    let products = [];
    try {
      const Product = mongoose.models.Product;
      if (Product) {
        const total = await Product.countDocuments(query);
        products = await Product.find(query)
          .sort(sortOption)
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
      }
    } catch (error) {
      console.log('Product model not found, returning empty array');
    }

    return NextResponse.json({
      products: [],
      pagination: {
        current: 1,
        total: 1,
        count: 0,
        totalItems: 0
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