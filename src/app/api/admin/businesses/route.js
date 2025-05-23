import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Business from '@/models/Business';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch all businesses for admin management
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

    // Fetch businesses with optional filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Build query filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (type) {
      filter.type = { $regex: new RegExp(type, 'i') };
    }

    // Fetch all businesses with pagination
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Fetch businesses
    const businesses = await Business.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'name email')
      .lean();

    // Count total businesses matching filter
    const total = await Business.countDocuments(filter);

    // Transform MongoDB objects to plain objects
    const serializedBusinesses = businesses.map(business => ({
      ...business,
      _id: business._id.toString(),
      ownerId: business.ownerId ? {
        ...business.ownerId,
        _id: business.ownerId._id.toString()
      } : null,
      createdAt: business.createdAt?.toISOString(),
      updatedAt: business.updatedAt?.toISOString(),
    }));

    return NextResponse.json({
      businesses: serializedBusinesses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching businesses for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}
