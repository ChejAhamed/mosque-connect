import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;

    let query = { 
      isActive: true,
      $or: [
        { startDate: { $lte: new Date() } },
        { startDate: { $exists: false } }
      ]
    };

    // Filter out expired announcements
    query.$and = [
      {
        $or: [
          { endDate: { $gte: new Date() } },
          { endDate: { $exists: false } }
        ]
      }
    ];

    if (type && type !== 'all') {
      query.type = type;
    }

    const total = await Announcement.countDocuments(query);

    const announcements = await Announcement.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      announcements,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: announcements.length,
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Error fetching public announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}