import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';

// For static export compatibility
import BusinessModel from '@/models/Business';
import UserModel from '@/models/User';
import { z } from 'zod';
import mongoose from 'mongoose';

// Zod schema for validating product update data
const productUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(800).optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isHalal: z.boolean().optional(),
});

// Get business and verify access
async function getBusinessForAuthenticatedUser(session) {
  if (!session || !session.user || !session.user.id) {
    return { error: 'Unauthorized', status: 401 };
  }

  await connectToDatabase();

  // Verify user is a business owner
  const user = await UserModel.findById(session.user.id);
  if (!user || user.role !== 'business') {
    return { error: 'Forbidden - User is not a business owner', status: 403 };
  }

  // Find the business profile
  const business = await BusinessModel.findOne({ ownerId: session.user.id });
  if (!business) {
    return { error: 'Business profile not found for this user', status: 404 };
  }

  return { business };
}

// PATCH/update a specific product by ID
export async function PATCH(req, { params }) {
  try {
    const { productId } = params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const result = await getBusinessForAuthenticatedUser(session);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;

    // Find the product to update
    const productToUpdate = business.products.id(productId);
    if (!productToUpdate) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse and validate the request body
    const body = await req.json();
    const validationResult = productUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    // Update the product fields
    const updateData = validationResult.data;
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        productToUpdate[key] = updateData[key];
      }
    });

    // Save the updated business document
    await business.save();

    return NextResponse.json(
      { message: 'Product updated successfully', product: productToUpdate },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a specific product by ID
export async function DELETE(req, { params }) {
  try {
    const { productId } = params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const result = await getBusinessForAuthenticatedUser(session);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { business } = result;

    // Find the product index
    const productIndex = business.products.findIndex(
      (product) => product._id.toString() === productId
    );

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Remove the product from the array
    business.products.splice(productIndex, 1);

    // Save the updated business document
    await business.save();

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
