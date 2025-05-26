import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerApplication from '@/models/VolunteerApplication';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'imam') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const applications = await VolunteerApplication.find(query)
      .populate('userId', 'name email city phone')
      .populate('mosqueId', 'name city address')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };

    return NextResponse.json({
      data: {
        applications,
        stats
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}