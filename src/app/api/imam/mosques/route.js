import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Mosque from '@/models/Mosque';
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

    // Get mosques associated with the imam
    const mosques = await Mosque.find({ imamId: session.user.id }).lean();

    // If admin, allow them to see all mosques
    if (session.user.role === 'admin' && mosques.length === 0) {
      const allMosques = await Mosque.find().lean();
      return NextResponse.json({
        mosques: allMosques,
      });
    }

    return NextResponse.json({
      mosques,
    });
  } catch (error) {
    console.error('Error fetching imam mosques:', error);
    return NextResponse.json(
      { message: 'Error fetching mosques', error: error.message },
      { status: 500 }
    );
  }
}
