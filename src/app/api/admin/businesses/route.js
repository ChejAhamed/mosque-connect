import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    let query = {};

    if (status && status !== 'all') {
      query['verification.status'] = status;
    }

    const total = await Business.countDocuments(query);

    const businesses = await Business.find(query)
      .populate('owner', 'name email createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Transform the data to match frontend expectations
    const transformedBusinesses = businesses.map(business => ({
      ...business,
      businessName: business.name,
      email: business.contact?.email,
      phone: business.contact?.phone,
      website: business.contact?.website,
      address: business.contact?.address,
      operatingHours: business.hours,
      status: business.verification?.status || 'pending'
    }));

    return NextResponse.json({
      businesses: transformedBusinesses,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: transformedBusinesses.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}