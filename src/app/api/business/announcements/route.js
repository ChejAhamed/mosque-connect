import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/mocks'; // Changed to use mocks for static export
import { connectToDB } from '@/lib/mocks'; // Changed to use mocks for static export

// For static export compatibility
import Business from '@/models/Business';
import mongoose from 'mongoose';
import { isBusiness } from '@/lib/auth-utils';

/**
 * @route GET /api/business/announcements
 * @description Get all announcements for the business owned by the logged-in user
 * @access Private (Business users only)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is a business owner
    if (!isBusiness(session)) {
      return NextResponse.json({ error: 'Not authorized. Business role required.' }, { status: 403 });
    }

    // Connect to the database
    await connectToDB();

    // Find the business owned by the user
    const business = await Business.findOne({ ownerId: session.user.id });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Return the announcements from the business
    return NextResponse.json({
      success: true,
      announcements: business.announcements || []
    });
  } catch (error) {
    console.error('Error fetching business announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

/**
 * @route POST /api/business/announcements
 * @description Create a new announcement for the business
 * @access Private (Business users only)
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if user is a business owner
    if (!isBusiness(session)) {
      return NextResponse.json({ error: 'Not authorized. Business role required.' }, { status: 403 });
    }

    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Connect to the database
    await connectToDB();

    // Find the business owned by the user
    const business = await Business.findOne({ ownerId: session.user.id });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Create a new announcement
    const newAnnouncement = {
      _id: new mongoose.Types.ObjectId(),
      title: data.title,
      content: data.content,
      imageUrl: data.imageUrl || null,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : null,
      isActive: data.hasOwnProperty('isActive') ? data.isActive : true,
      type: data.type || 'announcement',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the announcement to the business
    business.announcements.push(newAnnouncement);
    await business.save();

    return NextResponse.json({
      success: true,
      announcement: newAnnouncement
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating business announcement:', error);
    return NextResponse.json({
      error: 'Failed to create announcement',
      details: error.message
    }, { status: 500 });
  }
}
