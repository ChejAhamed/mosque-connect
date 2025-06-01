import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/db';
import Business from '@/models/Business';
import Offer from '@/models/Offer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    // Build query
    let query = { businessId: business._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Offer.countDocuments(query);

    // Get offers with pagination
    const offers = await Offer.find(query)
      .populate('applicableProducts', 'name price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      offers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: offers.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      title,
      description,
      discountType,
      discountValue,
      applicableProducts,
      applicableCategories,
      minimumPurchase,
      validFrom,
      validTo,
      status,
      featured,
      termsAndConditions,
      usageLimit,
      customerLimit,
      code,
      autoApply,
      priority,
      image
    } = data;

    // Validation
    if (!title || !discountType || !discountValue || !validFrom || !validTo) {
      return NextResponse.json(
        { error: 'Title, discount type, discount value, and validity period are required' },
        { status: 400 }
      );
    }

    if (discountValue <= 0) {
      return NextResponse.json(
        { error: 'Discount value must be greater than 0' },
        { status: 400 }
      );
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return NextResponse.json(
        { error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    if (new Date(validFrom) >= new Date(validTo)) {
      return NextResponse.json(
        { error: 'Valid from date must be before valid to date' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if code is unique (if provided)
    if (code) {
      const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
      if (existingOffer) {
        return NextResponse.json(
          { error: 'Offer code already exists' },
          { status: 400 }
        );
      }
    }

    // Create offer
    const offer = new Offer({
      businessId: business._id,
      title: title.trim(),
      description: description?.trim() || '',
      discountType,
      discountValue: parseFloat(discountValue),
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      minimumPurchase: minimumPurchase ? parseFloat(minimumPurchase) : 0,
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      status: status || 'draft',
      featured: featured || false,
      termsAndConditions: termsAndConditions?.trim() || '',
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      customerLimit: customerLimit ? parseInt(customerLimit) : undefined,
      code: code ? code.toUpperCase() : undefined,
      autoApply: autoApply || false,
      priority: parseInt(priority) || 0,
      image: image?.trim() || ''
    });

    await offer.save();

    return NextResponse.json({
      offer,
      message: 'Offer created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating offer:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}