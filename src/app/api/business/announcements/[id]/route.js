import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Announcement from '@/models/Announcement';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = ['admin', 'superadmin'].includes(session.user.role);
    const isBusiness = session.user.role === 'business';

    if (!isAdmin && !isBusiness) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    let announcement;

    if (isAdmin) {
      // Admin can view any announcement
      announcement = await Announcement.findById(params.id).populate('businessId', 'name');
    } else {
      // Business can only view their own announcements
      const business = await Business.findOne({ owner: session.user.id });
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
      announcement = await Announcement.findOne({
        _id: params.id,
        businessId: business._id
      }).populate('businessId', 'name');
    }

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

    const isAdmin = ['admin', 'superadmin'].includes(session.user.role);
    const isBusiness = session.user.role === 'business';

    if (!isAdmin && !isBusiness) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    const { title, content, type, isActive, expiresAt } = data;

    await connectDB();

    let updateQuery = { _id: params.id };
    
    if (isBusiness) {
      // Business can only update their own announcements
      const business = await Business.findOne({ owner: session.user.id });
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
      updateQuery.businessId = business._id;
    }
    // Admin can update any announcement (no additional filter needed)

    const announcement = await Announcement.findOneAndUpdate(
      updateQuery,
      {
        title,
        content,
        type: type || 'general',
        isActive: isActive !== undefined ? isActive : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('businessId', 'name');

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

    const isAdmin = ['admin', 'superadmin'].includes(session.user.role);
    const isBusiness = session.user.role === 'business';

    if (!isAdmin && !isBusiness) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    let deleteQuery = { _id: params.id };
    
    if (isBusiness) {
      // Business can only delete their own announcements
      const business = await Business.findOne({ owner: session.user.id });
      if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
      }
      deleteQuery.businessId = business._id;
    }
    // Admin can delete any announcement (no additional filter needed)

    const announcement = await Announcement.findOneAndDelete(deleteQuery);

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