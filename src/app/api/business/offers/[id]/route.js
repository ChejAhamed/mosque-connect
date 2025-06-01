import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Offer from '@/models/Offer';

export async function GET(request, { params }) {
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

    // Find offer belonging to this business
    const offer = await Offer.findOne({
      _id: params.id,
      businessId: business._id
    }).populate('applicableProducts', 'name price').lean();

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      offer,
      message: 'Offer retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    if (title !== undefined && !title.trim()) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    if (discountValue !== undefined && discountValue <= 0) {
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

    if (validFrom && validTo && new Date(validFrom) >= new Date(validTo)) {
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

    // Check if code is unique (if provided and changed)
    if (code) {
      const existingOffer = await Offer.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: params.id }
      });
      if (existingOffer) {
        return NextResponse.json(
          { error: 'Offer code already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = parseFloat(discountValue);
    if (applicableProducts !== undefined) updateData.applicableProducts = applicableProducts;
    if (applicableCategories !== undefined) updateData.applicableCategories = applicableCategories;
    if (minimumPurchase !== undefined) {
      updateData.minimumPurchase = minimumPurchase ? parseFloat(minimumPurchase) : 0;
    }
    if (validFrom !== undefined) updateData.validFrom = new Date(validFrom);
    if (validTo !== undefined) updateData.validTo = new Date(validTo);
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (termsAndConditions !== undefined) updateData.termsAndConditions = termsAndConditions.trim();
    if (usageLimit !== undefined) {
      updateData.usageLimit = usageLimit ? parseInt(usageLimit) : undefined;
    }
    if (customerLimit !== undefined) {
      updateData.customerLimit = customerLimit ? parseInt(customerLimit) : undefined;
    }
    if (code !== undefined) updateData.code = code ? code.toUpperCase() : undefined;
    if (autoApply !== undefined) updateData.autoApply = autoApply;
    if (priority !== undefined) updateData.priority = parseInt(priority) || 0;
    if (image !== undefined) updateData.image = image.trim();

    updateData.updatedAt = new Date();

    // Update offer
    const offer = await Offer.findOneAndUpdate(
      {
        _id: params.id,
        businessId: business._id
      },
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('applicableProducts', 'name price');

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      offer,
      message: 'Offer updated successfully'
    });

  } catch (error) {
    console.error('Error updating offer:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Update specific fields
    const offer = await Offer.findOneAndUpdate(
      {
        _id: params.id,
        businessId: business._id
      },
      {
        ...data,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('applicableProducts', 'name price');

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      offer,
      message: 'Offer updated successfully'
    });

  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    // Delete offer
    const offer = await Offer.findOneAndDelete({
      _id: params.id,
      businessId: business._id
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Offer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    );
  }
}