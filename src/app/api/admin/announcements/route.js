import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;

    let query = { isAdminAnnouncement: true };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    const total = await Announcement.countDocuments(query);

    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
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
    console.error('Error fetching admin announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    
    console.log('Creating admin announcement with data:', data);

    await connectDB();

    // Validate required fields
    if (!data.title || !data.content || !data.type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Get the admin user's ObjectId
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    const announcementData = {
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority || 'medium',
      targetAudience: data.targetAudience || 'all',
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate || new Date(),
      endDate: data.endDate || null,
      createdBy: adminUser._id,
      isAdminAnnouncement: true,
    };

    console.log('Final announcement data:', announcementData);

    const announcement = await Announcement.create(announcementData);

    // Return the announcement without population to avoid schema issues
    const createdAnnouncement = await Announcement.findById(announcement._id).lean();

    console.log('Created announcement:', createdAnnouncement);

    return NextResponse.json({
      announcement: createdAnnouncement,
      message: 'Admin announcement created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement', details: error.message },
      { status: 500 }
    );
  }
}