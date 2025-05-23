import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Business from '@/models/Business';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH - Update business status (approve/reject)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can approve or reject businesses.' },
        { status: 401 }
      );
    }

    const businessId = params.businessId;
    if (!businessId || !businessId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "pending", "approved", or "rejected".' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and update the business
    const business = await Business.findById(businessId);

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Update business status and verification details
    business.status = status;
    business.verificationNotes = notes || '';
    business.verifiedBy = session.user.id;
    business.verifiedAt = new Date();

    await business.save();

    // Return the updated business
    return NextResponse.json({
      message: `Business ${status} successfully`,
      business: {
        _id: business._id.toString(),
        name: business.name,
        status: business.status,
        verificationNotes: business.verificationNotes,
        verifiedAt: business.verifiedAt.toISOString(),
        verifiedBy: session.user.id
      }
    });
  } catch (error) {
    console.error(`Error updating business status:`, error);
    return NextResponse.json(
      { error: 'Failed to update business status' },
      { status: 500 }
    );
  }
}

// GET - Fetch a specific business details for admin
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can access this endpoint.' },
        { status: 401 }
      );
    }

    const businessId = params.businessId;
    if (!businessId || !businessId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid business ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the business with populated owner data
    const business = await Business.findById(businessId)
      .populate('ownerId verifiedBy', 'name email')
      .lean();

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Transform MongoDB object to plain object
    const serializedBusiness = {
      ...business,
      _id: business._id.toString(),
      ownerId: business.ownerId ? {
        ...business.ownerId,
        _id: business.ownerId._id.toString()
      } : null,
      verifiedBy: business.verifiedBy ? {
        ...business.verifiedBy,
        _id: business.verifiedBy._id.toString()
      } : null,
      createdAt: business.createdAt?.toISOString(),
      updatedAt: business.updatedAt?.toISOString(),
      verifiedAt: business.verifiedAt?.toISOString(),
    };

    return NextResponse.json({ business: serializedBusiness });
  } catch (error) {
    console.error(`Error fetching business details:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch business details' },
      { status: 500 }
    );
  }
}
