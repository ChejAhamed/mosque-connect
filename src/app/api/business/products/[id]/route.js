import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import  authOptions from '@/lib/auth';
import  connectDB from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Find product belonging to this business
    const product = await Product.findOne({
      _id: params.id,
      businessId: business._id
    }).lean();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
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

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      status,
      featured,
      tags,
      specifications,
      variants,
      availability
    } = data;

    // Validation
    if (name !== undefined && !name.trim()) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    if (price !== undefined && price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) {
      updateData.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : undefined;
    }
    if (category !== undefined) updateData.category = category.trim();
    if (subcategory !== undefined) updateData.subcategory = subcategory.trim();
    if (images !== undefined) updateData.images = images;
    if (status !== undefined) updateData.status = status;
    if (featured !== undefined) updateData.featured = featured;
    if (tags !== undefined) updateData.tags = tags;
    if (specifications !== undefined) updateData.specifications = specifications;
    if (variants !== undefined) updateData.variants = variants;
    if (availability !== undefined) updateData.availability = availability;
    
    if (inventory !== undefined) {
      updateData.inventory = {
        stock: inventory.unlimited ? 0 : parseInt(inventory.stock) || 0,
        unlimited: inventory.unlimited || false,
        trackInventory: inventory.trackInventory !== false,
        lowStockThreshold: parseInt(inventory.lowStockThreshold) || 10
      };
    }

    updateData.updatedAt = new Date();

    // Update product
    const product = await Product.findOneAndUpdate(
      {
        _id: params.id,
        businessId: business._id
      },
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
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
    const product = await Product.findOneAndUpdate(
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
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
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

    // Delete product
    const product = await Product.findOneAndDelete({
      _id: params.id,
      businessId: business._id
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update business product count
    if (business.updateProductCount) {
      await business.updateProductCount();
    }

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}