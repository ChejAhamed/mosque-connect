import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/mocks'; // Changed to use mocks for static export
import { connectToDB } from '@/lib/mocks'; // Changed to use mocks for static export
import { ANNOUNCEMENT_IDS } from '@/lib/staticParams';
import Business from '@/models/Business';
import mongoose from 'mongoose';
import { isBusiness } from '@/lib/auth-utils';

// For static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// Define generateStaticParams for static export
export function generateStaticParams() {
  return ANNOUNCEMENT_IDS;
}

/**
 * @route GET /api/business/announcements/[announcementId]
 * @description Get a specific announcement by ID
 * @access Private (Business users only)
 */
export async function GET(request, { params }) {
  try {
    const { announcementId } = params;
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
    const business = await Business.findOne({
      ownerId: session.user.id,
      'announcements._id': announcementId
    });

    if (!business) {
      return NextResponse.json({ error: 'Business or announcement not found' }, { status: 404 });
    }

    // Find the specific announcement
    const announcement = business.announcements.find(
      a => a._id.toString() === announcementId
    );

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 });
  }
}

/**
 * @route PATCH /api/business/announcements/[announcementId]
 * @description Update a specific announcement
 * @access Private (Business users only)
 */
export async function PATCH(request, { params }) {
  try {
    const { announcementId } = params;
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

    // Connect to the database
    await connectToDB();

    // Find the business owned by the user
    const business = await Business.findOne({
      ownerId: session.user.id,
      'announcements._id': announcementId
    });

    if (!business) {
      return NextResponse.json({ error: 'Business or announcement not found' }, { status: 404 });
    }

    // Find the announcement index
    const announcementIndex = business.announcements.findIndex(
      a => a._id.toString() === announcementId
    );

    if (announcementIndex === -1) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    // Update announcement fields
    if (data.title) business.announcements[announcementIndex].title = data.title;
    if (data.content) business.announcements[announcementIndex].content = data.content;
    if (data.hasOwnProperty('imageUrl')) business.announcements[announcementIndex].imageUrl = data.imageUrl;
    if (data.hasOwnProperty('startDate')) {
      business.announcements[announcementIndex].startDate = data.startDate ? new Date(data.startDate) : new Date();
    }
    if (data.hasOwnProperty('endDate')) {
      business.announcements[announcementIndex].endDate = data.endDate ? new Date(data.endDate) : null;
    }
    if (data.hasOwnProperty('isActive')) {
      business.announcements[announcementIndex].isActive = data.isActive;
    }
    if (data.type) business.announcements[announcementIndex].type = data.type;

    // Update the updatedAt timestamp
    business.announcements[announcementIndex].updatedAt = new Date();

    // Save the changes
    await business.save();

    return NextResponse.json({
      success: true,
      announcement: business.announcements[announcementIndex]
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({
      error: 'Failed to update announcement',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * @route DELETE /api/business/announcements/[announcementId]
 * @description Delete a specific announcement
 * @access Private (Business users only)
 */
export async function DELETE(request, { params }) {
  try {
    const { announcementId } = params;
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

    // Find the business and pull the announcement from the array
    const result = await Business.updateOne(
      {
        ownerId: session.user.id,
        'announcements._id': announcementId
      },
      {
        $pull: { announcements: { _id: announcementId } }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Business or announcement not found' }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Announcement not deleted' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({
      error: 'Failed to delete announcement',
      details: error.message
    }, { status: 500 });
  }
}
