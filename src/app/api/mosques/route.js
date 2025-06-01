import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Mosque from '@/models/Mosque';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all mosques or filter by query parameters
export async function GET(request) {
  try {
    await connectDB();
    console.log('Connected to DB, fetching mosques...');

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const name = searchParams.get('name');
    const features = searchParams.get('features')?.split(',');

    // Build query filter
    const filter = {
      // Only show approved mosques to regular users
      status: 'approved'
    };

    // Check if admin or imam user is authenticated
    const session = await getServerSession(authOptions);
    if (session && (session.user.role === 'admin' || session.user.role === 'imam')) {
      // For admins and imams, allow seeing all mosques based on optional status filter
      const statusFilter = searchParams.get('status');
      if (statusFilter && ['pending', 'approved', 'rejected'].includes(statusFilter)) {
        filter.status = statusFilter;
      } else {
        // If no status filter provided, remove the status filter for admins/imams
        delete filter.status;
      }
    }

    if (city) filter['contact.address.city'] = { $regex: new RegExp(city, 'i') };
    if (state) filter['contact.address.state'] = { $regex: new RegExp(state, 'i') };
    if (name) filter.name = { $regex: new RegExp(name, 'i') };
    if (features && features.length > 0) {
      filter.facilities = { $in: features };
    }

    // Fetch mosques with pagination
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log('Query filter:', filter);

    const mosques = await Mosque.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('imam', 'name email')
      .lean();

    console.log(`Found ${mosques.length} mosques`);

    const total = await Mosque.countDocuments(filter);

    // Transform mosques to match your frontend expectations
    const transformedMosques = mosques.map(mosque => ({
      _id: mosque._id,
      name: mosque.name,
      description: mosque.description,
      address: mosque.contact?.address?.street || '',
      city: mosque.contact?.address?.city || '',
      state: mosque.contact?.address?.state || '',
      zipCode: mosque.contact?.address?.zipCode || '',
      phone: mosque.contact?.phone || '',
      email: mosque.contact?.email || '',
      website: mosque.contact?.website || '',
      imageUrl: mosque.imageUrl || '',
      facilityFeatures: mosque.facilities || [],
      prayerTimes: mosque.prayerTimes || {},
      location: mosque.contact?.address?.coordinates ? {
        type: 'Point',
        coordinates: mosque.contact.address.coordinates
      } : null,
      status: mosque.status,
      verified: mosque.verified,
      imam: mosque.imam,
      capacity: mosque.capacity,
      services: mosque.services || [],
      stats: mosque.stats || {},
      createdAt: mosque.createdAt,
      updatedAt: mosque.updatedAt,
      verificationNotes: mosque.verificationNotes,
      verifiedAt: mosque.verifiedAt,
      verifiedBy: mosque.verifiedBy
    }));

    return NextResponse.json({
      success: true,
      data: transformedMosques,
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
      { success: false, error: 'Failed to fetch mosques', message: error.message },
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
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only imams and admins can create mosques
    if (session.user.role !== 'imam' && session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden. Only imams and admins can create mosques.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('Creating mosque with data:', body);

    await connectDB();

    // Create new mosque with the correct field structure
    const mosqueData = {
      name: body.name,
      description: body.description,
      imam: session.user.id, // Use the correct field name from your model
      contact: {
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: {
          street: body.address,
          city: body.city,
          state: body.state,
          zipCode: body.zipCode,
          country: body.country || 'United States',
          coordinates: body.location?.coordinates || null
        }
      },
      capacity: body.capacity,
      services: body.services || [],
      facilities: body.facilityFeatures || [],
      prayerTimes: body.prayerTimes || {},
      status: 'pending', // Default status
      verified: false,
      stats: {
        totalMembers: 0,
        totalEvents: 0,
        totalVolunteers: 0
      }
    };

    const mosque = await Mosque.create(mosqueData);
    console.log('Created mosque:', mosque);

    return NextResponse.json({ 
      success: true, 
      data: mosque,
      message: 'Mosque created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating mosque:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create mosque', message: error.message },
      { status: 500 }
    );
  }
}