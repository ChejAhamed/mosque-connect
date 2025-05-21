import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Mosque } from '@/models/Mosque';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// For static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
import { z } from 'zod';

// Validation schema for creating a mosque
const mosqueSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'Zip code must be at least 5 characters'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  description: z.string().optional(),
  facilityFeatures: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  location: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
  }).optional(),
  imamId: z.string().optional(),
});

// GET all mosques or filter by query parameters
export async function GET(request) {
  try {
    await connectToDatabase();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const name = searchParams.get('name');
    const features = searchParams.get('features')?.split(',');

    // Build query filter
    const filter = {};

    if (city) filter.city = { $regex: new RegExp(city, 'i') };
    if (state) filter.state = { $regex: new RegExp(state, 'i') };
    if (name) filter.name = { $regex: new RegExp(name, 'i') };
    if (features && features.length > 0) {
      filter.facilityFeatures = { $in: features };
    }

    // Fetch mosques with pagination
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const mosques = await Mosque.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('imamId', 'name email')
      .lean();

    const total = await Mosque.countDocuments(filter);

    return NextResponse.json({
      mosques,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching mosques:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mosques' },
      { status: 500 }
    );
  }
}

// POST create a new mosque
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only imams and admins can create mosques
    if (session.user.role !== 'imam' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden. Only imams and admins can create mosques.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input data
    const result = mosqueSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Create new mosque
    const mosque = new Mosque({
      ...result.data,
      imamId: session.user.id, // Set current user as imam
      verified: false, // New mosques need verification
      createdAt: new Date(),
      updatedAt: new Date(),
      prayerTimes: body.prayerTimes || {}, // Handle prayer times if provided
    });

    await mosque.save();

    return NextResponse.json({ mosque }, { status: 201 });
  } catch (error) {
    console.error('Error creating mosque:', error);
    return NextResponse.json(
      { error: 'Failed to create mosque' },
      { status: 500 }
    );
  }
}
