import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerApplication from '@/models/VolunteerApplication';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Build query
    let query = { userId: session.user.id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count
    const total = await VolunteerApplication.countDocuments(query);

    // Get applications with pagination
    const applications = await VolunteerApplication.find(query)
      .populate('mosqueId', 'name address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      applications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: applications.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer applications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { mosqueId, category, message, skills, availability } = data;

    if (!mosqueId || !category) {
      return NextResponse.json(
        { error: 'Mosque ID and category are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already has a pending application for this mosque
    const existingApplication = await VolunteerApplication.findOne({
      userId: session.user.id,
      mosqueId,
      status: 'pending'
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending application for this mosque' },
        { status: 400 }
      );
    }

    const application = new VolunteerApplication({
      userId: session.user.id,
      mosqueId,
      category,
      message: message || '',
      skills: skills || [],
      availability: availability || {},
      status: 'pending'
    });

    await application.save();

    // Populate the response
    await application.populate('mosqueId', 'name address');

    return NextResponse.json({
      application,
      message: 'Volunteer application submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating volunteer application:', error);
    return NextResponse.json(
      { error: 'Failed to submit volunteer application' },
      { status: 500 }
    );
  }
}