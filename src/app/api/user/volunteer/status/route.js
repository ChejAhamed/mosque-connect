import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import VolunteerApplication from '@/models/VolunteerApplication';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user volunteer status and calculate stats
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get volunteer applications to calculate total hours
    const applications = await VolunteerApplication.find({ 
      userId: session.user.id,
      status: 'accepted'
    });

    // Calculate total volunteer hours (assuming each accepted application = 10 hours for now)
    const totalHours = applications.length * 10;

    const volunteerStatus = {
      status: user.volunteerStatus || 'inactive',
      activeSince: user.volunteerActiveSince || null,
      totalHours: totalHours,
      totalApplications: applications.length,
      skills: user.volunteerSkills || [],
      availability: user.volunteerAvailability || {},
      contactPreferences: user.volunteerContactPreferences || {},
      certificates: user.volunteerCertificates || []
    };

    return NextResponse.json(volunteerStatus);

  } catch (error) {
    console.error('Error fetching volunteer status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer status' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    const updateData = {
      volunteerStatus: status
    };

    // If activating, set the activation date
    if (status === 'active') {
      updateData.volunteerActiveSince = new Date();
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      status: user.volunteerStatus,
      activeSince: user.volunteerActiveSince,
      message: `Volunteer status ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error updating volunteer status:', error);
    return NextResponse.json(
      { error: 'Failed to update volunteer status' },
      { status: 500 }
    );
  }
}