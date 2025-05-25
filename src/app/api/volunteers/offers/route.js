import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/app/api/auth/[...nextauth]/config';
import connectDB from '@/lib/db'; // Changed this line
import { VolunteerOffer } from '@/models/VolunteerOffer';

export async function GET() {
  try {
    await connectDB();
    
    const offers = await VolunteerOffer.find({ status: 'active' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching volunteer offers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteer offers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'user') {
      return NextResponse.json(
        { success: false, message: 'Only community members can post volunteer offers' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const data = await request.json();
    console.log('Received data:', data);
    
    const volunteerOffer = await VolunteerOffer.create({
      userId: session.user.id,
      title: data.title,
      description: data.description,
      category: data.category,
      skillsOffered: data.skillsOffered || [],
      availability: data.availability,
      timeCommitment: data.timeCommitment,
      experience: data.experience,
      languages: data.languages || [],
      targetMosqueId: data.targetMosqueId || null,
      isGeneralOffer: data.isGeneralOffer !== false,
      contactInfo: {
        email: data.contactInfo?.email || data.contactEmail,
        phone: data.contactInfo?.phone || data.contactPhone || '',
      },
    });

    return NextResponse.json({
      success: true,
      data: volunteerOffer,
      message: data.targetMosqueId 
        ? 'Volunteer registration submitted to mosque successfully'
        : 'Volunteer offer posted successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating volunteer offer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create volunteer offer', error: error.message },
      { status: 500 }
    );
  }
}