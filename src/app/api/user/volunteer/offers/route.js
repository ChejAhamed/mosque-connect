import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerOffer from '@/models/VolunteerOffer';

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

    // Build query - only get user's general offers
    let query = { 
      userId: session.user.id,
      isGeneralOffer: true
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count
    const total = await VolunteerOffer.countDocuments(query);

    // Get offers with pagination
    const offers = await VolunteerOffer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      offers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: offers.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching volunteer offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer offers' },
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
    const { title, description, category, availability, skills, status } = data;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const offer = new VolunteerOffer({
      userId: session.user.id,
      title,
      description,
      category,
      availability: availability || {},
      skills: skills || [],
      status: status || 'active',
      isGeneralOffer: true
    });

    await offer.save();

    return NextResponse.json({
      offer,
      message: 'Volunteer offer created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating volunteer offer:', error);
    return NextResponse.json(
      { error: 'Failed to create volunteer offer' },
      { status: 500 }
    );
  }
}