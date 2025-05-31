import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';

export async function POST(request, { params }) {
  try {
    await connectDB();

    // Verify business exists and is active
    const business = await Business.findById(params.businessId);
    if (!business || business.status !== 'active') {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Find and update product view count
    const product = await Product.findOneAndUpdate(
      {
        _id: params.productId,
        businessId: params.businessId,
        status: 'active'
      },
      { 
        $inc: { 'stats.views': 1 }
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product view tracked successfully',
      views: product.stats.views
    });

  } catch (error) {
    console.error('Error tracking product view:', error);
    return NextResponse.json(
      { error: 'Failed to track product view' },
      { status: 500 }
    );
  }
}