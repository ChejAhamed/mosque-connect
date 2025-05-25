import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import UserModel from '@/models/User';
import VolunteerModel from '@/models/Volunteer';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { z } from 'zod';

// Volunteer registration schema validation
const volunteerSchema = z.object({
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  otherSkills: z.string().optional(),
  availability: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional(),
    sunday: z.array(z.string()).optional(),
  }),
  isVisibleToAllMosques: z.boolean().default(false),
});

export async function POST(req) {
  try {
    // Get the current session to check authentication
    const session = await getServerSession(authConfig);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to register as a volunteer.' },
        { status: 401 }
      );
    }

    // Check if the user is a community member (user role)
    if (session.user.role !== 'user') {
      return NextResponse.json(
        { error: 'Only community members can register as volunteers.' },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectDB();

    // Get the user from the database
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Check if user is already a volunteer
    if (user.volunteerStatus !== 'not_volunteer') {
      return NextResponse.json(
        { error: 'You are already registered as a volunteer.' },
        { status: 409 }
      );
    }

    // Parse the request body
    const body = await req.json();

    // Validate the input data
    const result = volunteerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    // Extract volunteer data
    const { skills, otherSkills, availability, isVisibleToAllMosques } = result.data;

    // Update user's volunteer status to pending
    user.volunteerStatus = 'pending';
    await user.save();

    // Create a new volunteer record
    const volunteer = new VolunteerModel({
      userId: user._id,
      skills,
      otherSkills,
      availability,
      isVisibleToAllMosques,
    });

    await volunteer.save();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Volunteer registration successful. Your application is pending approval.'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Volunteer registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register as a volunteer.' },
      { status: 500 }
    );
  }
}
