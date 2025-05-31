import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'business') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    // Get business profile
    const business = await Business.findOne({ owner: session.user.id });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort') || 'createdAt';

    // Build query
    let query = { businessId: business._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    // Get total count
    const total = await Product.countDocuments(query);

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ [sort]: sort === 'createdAt' ? -1 : 1 })
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

export async function POST(request) {
  console.log('Creating product...');
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'business') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      subcategory,
      images,
      inventory,
      status = 'active',
      featured,
      tags,
      specifications,
      variants,
      availability
    } = data;

    // Validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Name, description, price, and category are required' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get business profile
    const business = await Business.findOne({ owner: session.user.id });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Create product
    const product = new Product({
      businessId: business._id,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      category: category.trim(),
      subcategory: subcategory?.trim(),
      images: images || [],
      inventory: {
        stock: inventory?.unlimited ? 0 : parseInt(inventory?.stock) || 0,
        unlimited: inventory?.unlimited || false,
        trackInventory: inventory?.trackInventory !== false,
        lowStockThreshold: parseInt(inventory?.lowStockThreshold) || 10
      },
      status,
      featured: featured || false,
      tags: tags || [],
      specifications: specifications || {},
      variants: variants || [],
      availability: availability || {
        inStore: true,
        online: true,
        delivery: false,
        pickup: true
      }
    });

    await product.save();

    // Update business product count
    if (business.updateProductCount) {
      await business.updateProductCount();
    }

    return NextResponse.json({
      product,
      message: 'Product created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}