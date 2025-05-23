import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HalalCertification from '@/models/HalalCertification';
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

    // Get all halal certification requests
    const requests = await HalalCertification.find().sort({ requestDate: -1 }).lean();

    return NextResponse.json({
      requests,
    });
  } catch (error) {
    console.error('Error fetching halal certification requests:', error);
    return NextResponse.json(
      { message: 'Error fetching halal certification requests', error: error.message },
      { status: 500 }
    );
  }
}
