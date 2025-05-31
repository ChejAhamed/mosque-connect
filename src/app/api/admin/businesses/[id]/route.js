import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const business = await Business.findById(params.id)
      .populate('owner', 'name email createdAt')
      .lean();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Transform the data to match frontend expectations
    const transformedBusiness = {
      ...business,
      businessName: business.name,
      email: business.contact?.email,
      phone: business.contact?.phone,
      website: business.contact?.website,
      address: business.contact?.address,
      operatingHours: business.hours,
      status: business.verification?.status || 'pending'
    };

    return NextResponse.json({
      business: transformedBusiness,
      message: 'Business retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();

    await connectDB();

    // Map frontend status to backend verification status
    let updateData = {};
    if (data.status) {
      updateData['verification.status'] = data.status;
      if (data.status === 'approved') {
        updateData['verification.status'] = 'verified';
        updateData['verification.verifiedAt'] = new Date();
        updateData['verification.verifiedBy'] = session.user.id;
      } else if (data.status === 'rejected') {
        updateData['verification.status'] = 'rejected';
      }
    }

    const business = await Business.findByIdAndUpdate(
      params.id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('owner', 'name email createdAt');

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Transform the data to match frontend expectations
    const transformedBusiness = {
      ...business.toObject(),
      businessName: business.name,
      email: business.contact?.email,
      phone: business.contact?.phone,
      website: business.contact?.website,
      address: business.contact?.address,
      operatingHours: business.hours,
      status: business.verification?.status || 'pending'
    };

    return NextResponse.json({
      business: transformedBusiness,
      message: 'Business updated successfully'
    });

  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
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

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const business = await Business.findByIdAndDelete(params.id);

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Business deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: 'Failed to delete business' },
      { status: 500 }
    );
  }
}