import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

// For static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
import BusinessModel from '@/models/Business';
import UserModel from '@/models/User';
import { z } from 'zod';
import mongoose from 'mongoose';

// Zod schema for validating product data
const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(800).optional(),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isHalal: z.boolean().default(true),
});

// GET all products for the logged-in business
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Verify user is a business owner
    const user = await UserModel.findById(session.user.id);
    if (!user || user.role !== 'business') {
      return NextResponse.json({ error: 'Forbidden - User is not a business owner' }, { status: 403 });
    }

    // Find the business profile for this user
    const business = await BusinessModel.findOne({ ownerId: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business profile not found for this user' }, { status: 404 });
    }

    // Return the products array (or empty array if no products)
    return NextResponse.json({ products: business.products || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST a new product
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Verify user is a business owner
    const user = await UserModel.findById(session.user.id);
    if (!user || user.role !== 'business') {
      return NextResponse.json({ error: 'Forbidden - User is not a business owner' }, { status: 403 });
    }

    // Find the business profile
    const business = await BusinessModel.findOne({ ownerId: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business profile not found for this user' }, { status: 404 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const validationResult = productSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Create a new product with a unique _id
    const newProduct = {
      _id: new mongoose.Types.ObjectId(),
      ...validationResult.data,
      createdAt: new Date()
    };

    // Add the product to the business's products array
    business.products.push(newProduct);
    await business.save();

    return NextResponse.json(
      { message: 'Product added successfully', product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
