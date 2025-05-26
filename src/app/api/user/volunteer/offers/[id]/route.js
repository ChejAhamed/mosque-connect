import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerOffer from '@/models/VolunteerOffer';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const offer = await VolunteerOffer.findOne({
      _id: params.id,
      userId: session.user.id
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ offer });

  } catch (error) {
    console.error('Error fetching volunteer offer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer offer' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, category, availability, skills, status } = data;

    await connectDB();

    const offer = await VolunteerOffer.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id
      },
      {
        title,
        description,
        category,
        availability: availability || {},
        skills: skills || [],
        status: status || 'active',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      offer,
      message: 'Volunteer offer updated successfully'
    });

  } catch (error) {
    console.error('Error updating volunteer offer:', error);
    return NextResponse.json(
      { error: 'Failed to update volunteer offer' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const offer = await VolunteerOffer.findOneAndDelete({
      _id: params.id,
      userId: session.user.id
    });

    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Volunteer offer deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting volunteer offer:', error);
    return NextResponse.json(
      { error: 'Failed to delete volunteer offer' },
      { status: 500 }
    );
  }
}