import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Mosque from '@/models/Mosque';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Mosque.countDocuments(query);

    const mosques = await Mosque.find(query)
      .populate('imam', 'name email') // Changed from 'userId' to 'imam'
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      mosques,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: mosques.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching mosques:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mosques' },
      { status: 500 }
    );
  }
}