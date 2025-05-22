import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HalalCertification from '@/models/HalalCertification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    // Authenticate user and check if they are an imam
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'imam' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { requestId } = params;
    const body = await request.json();
    const { status, reviewNotes } = body;

    // Validate status
    if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // Add reviewer info if status is changing
    if (status === 'under_review' || status === 'approved' || status === 'rejected') {
      updateData.reviewerId = session.user.id;
    }

    // Add review notes if provided
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }

    // Add certificate info if approved
    if (status === 'approved') {
      // Set expiry date to 1 year from now
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      updateData.expiryDate = expiryDate;

      // For a real implementation, you would generate and store the certificate URL
      updateData.certificateUrl = '/sample-certificate.pdf';
    }

    // Update request status
    const updatedRequest = await HalalCertification.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { message: 'Certification request not found' },
        { status: 404 }
      );
    }

    // If approved, also update the business record
    if (status === 'approved') {
      // For a complete implementation, you would update the Business record here
      // For example: await Business.findByIdAndUpdate(updatedRequest.businessId, { isHalalCertified: true });
    }

    return NextResponse.json({
      message: 'Certification request status updated successfully',
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating certification request status:', error);
    return NextResponse.json(
      { message: 'Error updating certification request status', error: error.message },
      { status: 500 }
    );
  }
}
