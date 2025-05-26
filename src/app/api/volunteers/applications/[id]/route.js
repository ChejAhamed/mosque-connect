import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerApplication from '@/models/VolunteerApplication';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['imam', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { status } = await request.json();

    if (!['pending', 'accepted', 'rejected', 'reviewed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const application = await VolunteerApplication.findByIdAndUpdate(
      id,
      { 
        status,
        'mosqueResponse.respondedBy': session.user.id,
        'mosqueResponse.respondedAt': new Date()
      },
      { new: true }
    );

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const application = await VolunteerApplication.findById(id)
      .populate('userId', 'name email city phone')
      .populate('mosqueId', 'name city address')
      .populate('mosqueResponse.respondedBy', 'name email');

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json(application);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}