import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Mosque from '@/models/Mosque';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH - Update mosque status (approve/reject)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can approve or reject mosques.' },
        { status: 401 }
      );
    }

    const mosqueId = params.mosqueId;
    if (!mosqueId || !mosqueId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid mosque ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, verificationNotes } = body;

    // Validate status
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "pending", "approved", or "rejected".' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find and update the mosque
    const mosque = await Mosque.findById(mosqueId);

    if (!mosque) {
      return NextResponse.json(
        { error: 'Mosque not found' },
        { status: 404 }
      );
    }

    // Update mosque status and verification details
    mosque.status = status;
    mosque.verificationNotes = verificationNotes || '';
    mosque.verifiedBy = session.user.id;
    mosque.verifiedAt = new Date();

    await mosque.save();

    // Return the updated mosque
    return NextResponse.json({
      message: `Mosque ${status} successfully`,
      mosque: {
        _id: mosque._id.toString(),
        name: mosque.name,
        status: mosque.status,
        verificationNotes: mosque.verificationNotes,
        verifiedAt: mosque.verifiedAt.toISOString(),
        verifiedBy: session.user.id
      }
    });
  } catch (error) {
    console.error(`Error updating mosque status:`, error);
    return NextResponse.json(
      { error: 'Failed to update mosque status' },
      { status: 500 }
    );
  }
}

// GET - Fetch a specific mosque details for admin
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

    const mosqueId = params.mosqueId;
    if (!mosqueId || !mosqueId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid mosque ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find the mosque with populated imam data
    const mosque = await Mosque.findById(mosqueId)
      .populate('imamId verifiedBy', 'name email')
      .lean();

    if (!mosque) {
      return NextResponse.json(
        { error: 'Mosque not found' },
        { status: 404 }
      );
    }

    // Transform MongoDB object to plain object
    const serializedMosque = {
      ...mosque,
      _id: mosque._id.toString(),
      imamId: mosque.imamId ? {
        ...mosque.imamId,
        _id: mosque.imamId._id.toString()
      } : null,
      verifiedBy: mosque.verifiedBy ? {
        ...mosque.verifiedBy,
        _id: mosque.verifiedBy._id.toString()
      } : null,
      createdAt: mosque.createdAt?.toISOString(),
      updatedAt: mosque.updatedAt?.toISOString(),
      verifiedAt: mosque.verifiedAt?.toISOString(),
    };

    return NextResponse.json({ mosque: serializedMosque });
  } catch (error) {
    console.error(`Error fetching mosque details:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch mosque details' },
      { status: 500 }
    );
  }
}
