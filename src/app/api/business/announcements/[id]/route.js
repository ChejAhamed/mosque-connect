import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Announcement from '@/models/Announcement';
import Business from '@/models/Business';

export async function GET(request, { params }) {
  console.log('=== GET /api/business/announcements/[id] called ===');
  console.log('Params:', params);
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let query = { _id: params.announcementId };

    // Add role-based filtering
    if (session.user.role === 'admin') {
      query.isAdminAnnouncement = true;
    } else if (session.user.role === 'business') {
      const business = await Business.findOne({ email: session.user.email });
      if (!business) {
        return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
      }
      query.businessId = business._id;
    } else if (session.user.role === 'imam') {
      query.businessId = { $exists: false };
      query.isAdminAnnouncement = { $ne: true };
    }

    const announcement = await Announcement.findOne(query).lean();

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      announcement,
      message: 'Announcement retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    if (!data.title || !data.content || !data.type) {
      return NextResponse.json(
        { error: 'Title, content, and type are required' },
        { status: 400 }
      );
    }

    let query = { _id: params.announcementId };

    if (session.user.role === 'admin') {
      query.isAdminAnnouncement = true;
    } else if (session.user.role === 'business') {
      const business = await Business.findOne({ email: session.user.email });
      if (!business) {
        return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
      }
      query.businessId = business._id;
    } else if (session.user.role === 'imam') {
      query.businessId = { $exists: false };
      query.isAdminAnnouncement = { $ne: true };
    }

    const updateData = {
      title: data.title,
      content: data.content,
      type: data.type,
      priority: data.priority || 'medium',
      targetAudience: data.targetAudience || 'all',
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    const announcement = await Announcement.findOneAndUpdate(
      query,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      announcement,
      message: 'Announcement updated successfully'
    });

  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let query = { _id: params.announcementId };

    if (session.user.role === 'admin') {
      query.isAdminAnnouncement = true;
    } else if (session.user.role === 'business') {
      const business = await Business.findOne({ email: session.user.email });
      if (!business) {
        return NextResponse.json({ error: 'Business profile not found' }, { status: 404 });
      }
      query.businessId = business._id;
    } else if (session.user.role === 'imam') {
      query.businessId = { $exists: false };
      query.isAdminAnnouncement = { $ne: true };
    }

    const announcement = await Announcement.findOneAndDelete(query);

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}