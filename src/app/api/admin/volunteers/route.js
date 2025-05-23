import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Volunteer from '@/models/Volunteer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch all volunteers for admin management
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can access this endpoint.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Fetch volunteers with optional filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Fetch all volunteers with pagination
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Fetch volunteers
    const volunteers = await Volunteer.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();

    // Count total volunteers matching filter
    const total = await Volunteer.countDocuments(filter);

    // Transform MongoDB objects to plain objects
    const serializedVolunteers = volunteers.map(volunteer => ({
      ...volunteer,
      _id: volunteer._id.toString(),
      userId: volunteer.userId ? {
        ...volunteer.userId,
        _id: volunteer.userId._id.toString()
      } : null,
      createdAt: volunteer.createdAt?.toISOString(),
      updatedAt: volunteer.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      volunteers: serializedVolunteers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching volunteers for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteers' },
      { status: 500 }
    );
  }
}
