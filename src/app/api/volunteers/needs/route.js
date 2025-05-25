import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/app/api/auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import { VolunteerNeed } from '@/models/VolunteerNeed';

export async function GET() {
  try {
    await connectDB();
    
    const needs = await VolunteerNeed.find({ status: 'active' })
      .populate('mosqueId', 'name location')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: needs,
    });
  } catch (error) {
    console.error('Error fetching volunteer needs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteer needs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'imam' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const data = await request.json();
    
    const volunteerNeed = await VolunteerNeed.create({
      ...data,
      postedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: volunteerNeed,
      message: 'Volunteer need posted successfully',
    });
  } catch (error) {
    console.error('Error creating volunteer need:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create volunteer need' },
      { status: 500 }
    );
  }
}