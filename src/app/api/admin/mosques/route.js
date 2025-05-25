import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Mosque from '@/models/Mosque';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch all mosques for admin management
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

    await connectDB();

    // Fetch mosques with optional filtering
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Fetch all mosques with pagination
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    // Fetch mosques with populated imam data
    const mosques = await Mosque.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .populate('imamId verifiedBy', 'name email')
      .lean();

    // Count total mosques matching filter
    const total = await Mosque.countDocuments(filter);

    // Transform MongoDB objects to plain objects
    const serializedMosques = mosques.map(mosque => ({
      ...mosque,
      _id: mosque._id.toString(),
      imamId: mosque.imamId ? {
        ...mosque.imamId,
        _id: mosque.imamId._id.toString()
      } : null,
      verifiedBy: mosque.verifiedBy ? {
        ...mosque.verifiedBy,
        _id: mosque.verifiedBy._id.toString()
      } : null,
      createdAt: mosque.createdAt?.toISOString(),
      updatedAt: mosque.updatedAt?.toISOString(),
      verifiedAt: mosque.verifiedAt?.toISOString(),
    }));

    return NextResponse.json({
      mosques: serializedMosques,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching mosques for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mosques' },
      { status: 500 }
    );
  }
}
