import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/app/api/auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import { VolunteerNeed } from '@/models/VolunteerNeed';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const data = await request.json();
    const { needId } = params;
    
    const need = await VolunteerNeed.findById(needId);
    
    if (!need) {
      return NextResponse.json(
        { success: false, message: 'Volunteer need not found' },
        { status: 404 }
      );
    }

    // Check if user already applied
    const existingApplication = need.applicants.find(
      app => app.userId.toString() === session.user.id
    );

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied for this opportunity' },
        { status: 400 }
      );
    }

    // Add application
    need.applicants.push({
      userId: session.user.id,
      message: data.message,
      experience: data.experience,
      availability: data.availability,
    });

    await need.save();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}