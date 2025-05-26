import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      'volunteerSkills volunteerAvailability volunteerContactPreferences volunteerCertificates volunteerBio volunteerExperience'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = {
      skills: user.volunteerSkills || [],
      availability: user.volunteerAvailability || {},
      contactPreferences: user.volunteerContactPreferences || {},
      certificates: user.volunteerCertificates || [],
      bio: user.volunteerBio || '',
      experience: user.volunteerExperience || ''
    };

    return NextResponse.json({ profile });

  } catch (error) {
    console.error('Error fetching volunteer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { skills, availability, contactPreferences, certificates, bio, experience } = data;

    await connectDB();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        volunteerSkills: skills || [],
        volunteerAvailability: availability || {},
        volunteerContactPreferences: contactPreferences || {},
        volunteerCertificates: certificates || [],
        volunteerBio: bio || '',
        volunteerExperience: experience || '',
        updatedAt: new Date()
      },
      { new: true }
    ).select('volunteerSkills volunteerAvailability volunteerContactPreferences volunteerCertificates volunteerBio volunteerExperience');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = {
      skills: user.volunteerSkills || [],
      availability: user.volunteerAvailability || {},
      contactPreferences: user.volunteerContactPreferences || {},
      certificates: user.volunteerCertificates || [],
      bio: user.volunteerBio || '',
      experience: user.volunteerExperience || ''
    };

    return NextResponse.json({
      profile,
      message: 'Volunteer profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating volunteer profile:', error);
    return NextResponse.json(
      { error: 'Failed to update volunteer profile' },
      { status: 500 }
    );
  }
}