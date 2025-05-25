import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { VolunteerNeed } from '@/models/VolunteerNeed';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const need = await VolunteerNeed.findById(params.needId)
      .populate('mosqueId', 'name location')
      .populate('postedBy', 'name email');

    if (!need) {
      return NextResponse.json(
        { success: false, message: 'Volunteer need not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: need,
    });
  } catch (error) {
    console.error('Error fetching volunteer need:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteer need' },
      { status: 500 }
    );
  }
}