import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/app/api/auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import { VolunteerApplication } from '@/models/VolunteerApplication';

export async function GET(request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const mosqueId = searchParams.get('mosqueId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    // Build query filter
    let filter = {};
    
    // If imam, only show applications for their mosque(s)
    if (session.user.role === 'imam' && mosqueId) {
      filter.mosqueId = mosqueId;
    }
    // If user, only show their own applications
    else if (session.user.role === 'user') {
      filter.userId = session.user.id;
    }
    // If admin, can see all (with optional filters)
    else if (session.user.role === 'admin') {
      if (mosqueId) filter.mosqueId = mosqueId;
      if (userId) filter.userId = userId;
    }
    // If not authorized
    else {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    if (status) filter.status = status;
    
    const applications = await VolunteerApplication.find(filter)
      .populate('userId', 'name email phone city')
      .populate('mosqueId', 'name address city')
      .populate('mosqueResponse.respondedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Error fetching volunteer applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteer applications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== 'user') {
      return NextResponse.json(
        { success: false, message: 'Only community members can submit applications' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const data = await request.json();
    console.log('Received volunteer application data:', data);
    
    const application = await VolunteerApplication.create({
      userId: session.user.id,
      mosqueId: data.mosqueId,
      title: data.title,
      description: data.description,
      motivationMessage: data.motivationMessage,
      category: data.category || 'other',
      skillsOffered: data.skillsOffered || [],
      availability: data.availability,
      timeCommitment: data.timeCommitment,
      experience: data.experience,
      languages: data.languages || [],
      contactInfo: {
        email: data.contactInfo?.email || data.contactEmail,
        phone: data.contactInfo?.phone || data.contactPhone || '',
      },
    });

    // Update user volunteer stats
    await updateUserApplicationStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Volunteer application submitted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating volunteer application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit volunteer application', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to update user application stats
async function updateUserApplicationStats(userId) {
  try {
    const { User } = await import('@/models/User');
    await User.findByIdAndUpdate(userId, {
      $inc: { 'volunteerStats.totalApplications': 1 },
      $set: { 'volunteerStats.lastVolunteerActivity': new Date() }
    });
  } catch (error) {
    console.error('Error updating user application stats:', error);
  }
}