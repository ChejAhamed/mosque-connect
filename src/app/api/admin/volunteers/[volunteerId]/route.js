import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Volunteer from '@/models/Volunteer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH - Update volunteer status (approve/reject)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can approve or reject volunteers.' },
        { status: 401 }
      );
    }

    const volunteerId = params.volunteerId;
    if (!volunteerId || !volunteerId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid volunteer ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "pending", "approved", or "rejected".' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and update the volunteer
    const volunteer = await Volunteer.findById(volunteerId);

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Update volunteer status and notes
    volunteer.status = status;
    volunteer.notes = notes || '';
    volunteer.reviewedBy = session.user.id;
    volunteer.reviewedAt = new Date();

    await volunteer.save();

    // Return the updated volunteer
    return NextResponse.json({
      message: `Volunteer ${status} successfully`,
      volunteer: {
        _id: volunteer._id.toString(),
        name: volunteer.name,
        status: volunteer.status,
        notes: volunteer.notes,
        reviewedAt: volunteer.reviewedAt.toISOString(),
        reviewedBy: session.user.id
      }
    });
  } catch (error) {
    console.error(`Error updating volunteer status:`, error);
    return NextResponse.json(
      { error: 'Failed to update volunteer status' },
      { status: 500 }
    );
  }
}

// GET - Fetch a specific volunteer details for admin
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can access this endpoint.' },
        { status: 401 }
      );
    }

    const volunteerId = params.volunteerId;
    if (!volunteerId || !volunteerId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid volunteer ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the volunteer with populated user data
    const volunteer = await Volunteer.findById(volunteerId)
      .populate('userId reviewedBy', 'name email')
      .lean();

    if (!volunteer) {
      return NextResponse.json(
        { error: 'Volunteer not found' },
        { status: 404 }
      );
    }

    // Transform MongoDB object to plain object
    const serializedVolunteer = {
      ...volunteer,
      _id: volunteer._id.toString(),
      userId: volunteer.userId ? {
        ...volunteer.userId,
        _id: volunteer.userId._id.toString()
      } : null,
      reviewedBy: volunteer.reviewedBy ? {
        ...volunteer.reviewedBy,
        _id: volunteer.reviewedBy._id.toString()
      } : null,
      createdAt: volunteer.createdAt?.toISOString(),
      updatedAt: volunteer.updatedAt?.toISOString(),
      reviewedAt: volunteer.reviewedAt?.toISOString(),
    };

    return NextResponse.json({ volunteer: serializedVolunteer });
  } catch (error) {
    console.error(`Error fetching volunteer details:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer details' },
      { status: 500 }
    );
  }
}
