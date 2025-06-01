import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';
import Business from '@/models/Business';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;

    let query = {};

    // If user is admin, they can see admin announcements
    if (session.user.role === 'admin') {
      query.isAdminAnnouncement = true;
    } 
    // If user is business, they can see their business announcements
    else if (session.user.role === 'business') {
      const business = await Business.findOne({ email: session.user.email });
      if (!business) {
        return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
      }
      query.businessId = business._id;
      query.isAdminAnnouncement = { $ne: true };
    }
    // If user is imam, they can see mosque announcements
    else if (session.user.role === 'imam') {
      query.isAdminAnnouncement = { $ne: true };
      query.businessId = { $exists: false };
    }
    else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

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
    console.error('Error fetching announcements:', error);
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

    const data = await request.json();
    console.log('Creating announcement with data:', data);
    console.log('Session user:', session.user);

    await connectDB();

    // Validate required fields
    if (!data.title || !data.content || !data.type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    // Get the user's ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let announcementData = {
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority || 'medium',
      targetAudience: data.targetAudience || 'all',
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate || new Date(),
      endDate: data.endDate || null,
      createdBy: user._id,
    };

    // Handle different user roles
    if (session.user.role === 'admin') {
      announcementData.isAdminAnnouncement = true;
    } 
    else if (session.user.role === 'business') {
      const business = await Business.findOne({ email: session.user.email });
      if (!business) {
        return NextResponse.json(
          { error: 'Business profile not found. Please complete your business registration.' },
          { status: 404 }
        );
      }
      announcementData.businessId = business._id;
      announcementData.isAdminAnnouncement = false;
    }
    else if (session.user.role === 'imam') {
      announcementData.isAdminAnnouncement = false;
    }
    else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    console.log('Final announcement data:', announcementData);

    const announcement = await Announcement.create(announcementData);
    const createdAnnouncement = await Announcement.findById(announcement._id).lean();

    console.log('Created announcement:', createdAnnouncement);

    return NextResponse.json({
      announcement: createdAnnouncement,
      message: 'Announcement created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement', details: error.message },
      { status: 500 }
    );
  }
}