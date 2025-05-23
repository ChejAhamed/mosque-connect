import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Volunteer from '@/models/Volunteer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    // Authenticate user and check if they are an imam
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'imam' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { volunteerId } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update volunteer status
    const updatedVolunteer = await Volunteer.findByIdAndUpdate(
      volunteerId,
      { status },
      { new: true }
    );

    if (!updatedVolunteer) {
      return NextResponse.json(
        { message: 'Volunteer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Volunteer status updated successfully',
      volunteer: updatedVolunteer,
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    return NextResponse.json(
      { message: 'Error updating volunteer status', error: error.message },
      { status: 500 }
    );
  }
}
