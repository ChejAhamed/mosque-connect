import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerApplication from '@/models/VolunteerApplication';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const mosqueId = searchParams.get('mosqueId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let filter = {};
    if (mosqueId) filter.mosqueId = mosqueId;
    if (status) filter.status = status;

    const applications = await VolunteerApplication.find(filter)
      .populate('userId', 'name email phone city')
      .populate('mosqueId', 'name address city')
      .populate('mosqueResponse.respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      data: applications
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

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    
    const application = new VolunteerApplication({
      ...data,
      userId: session.user.id,
      contactInfo: {
        email: data.contactInfo?.email || session.user.email,
        phone: data.contactInfo?.phone
      }
    });

    await application.save();

    return NextResponse.json({
      success: true,
      application
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating volunteer application:', error);
    return NextResponse.json(
      { error: 'Failed to create volunteer application' },
      { status: 500 }
    );
  }
}