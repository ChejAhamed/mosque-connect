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

    // Find product
    const product = await Product.findOne({
      _id: params.productId,
      businessId: params.businessId,
      status: 'active'
    }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if product is available online
    if (!product.availability?.online) {
      return NextResponse.json({ error: 'Product not available online' }, { status: 404 });
    }

    return NextResponse.json({
      product,
      message: 'Product retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}