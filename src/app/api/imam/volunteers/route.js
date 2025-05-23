import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Volunteer from '@/models/Volunteer';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Authenticate user and check if they are an imam
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'imam' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get all volunteers
    const volunteers = await Volunteer.find().lean();

    // Fetch user details for each volunteer
    const volunteersWithDetails = await Promise.all(
      volunteers.map(async (volunteer) => {
        const user = await User.findById(volunteer.userId).lean();
        if (!user) return volunteer;

        return {
          ...volunteer,
          name: user.name,
          email: user.email,
          phone: user.phone,
        };
      })
    );

    return NextResponse.json({
      volunteers: volunteersWithDetails,
    });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    return NextResponse.json(
      { message: 'Error fetching volunteers', error: error.message },
      { status: 500 }
    );
  }
}
