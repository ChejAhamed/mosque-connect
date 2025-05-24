import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import HalalCertification from "@/models/HalalCertification";

// GET /api/admin/halal-certifications/[certificationId]
// Get a single halal certification by ID
export async function GET(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { certificationId } = params;
    if (!certificationId) {
      return NextResponse.json(
        { message: "Certification ID is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the certification
    const certification = await HalalCertification.findById(certificationId)
      .populate("businessId", "name type address city")
      .lean();

    if (!certification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ certification });
  } catch (error) {
    console.error("Error fetching halal certification:", error);
    return NextResponse.json(
      { message: "Failed to fetch halal certification", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/halal-certifications/[certificationId]
// Update a halal certification status, add notes, or issue a certificate
export async function PATCH(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { certificationId } = params;
    if (!certificationId) {
      return NextResponse.json(
        { message: "Certification ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { status, reviewNotes, certificateNumber, expiryDate } = body;

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the certification
    const certification = await HalalCertification.findById(certificationId);
    if (!certification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    // Update the certification
    certification.status = status;

    if (reviewNotes) {
      certification.reviewNotes = reviewNotes;
    }

    // Record reviewer information
    certification.reviewerId = session.user.id;
    certification.reviewerName = session.user.name;

    // If approving, set certificate details
    if (status === "approved") {
      if (!expiryDate) {
        return NextResponse.json(
          { message: "Expiry date is required for approved certifications" },
          { status: 400 }
        );
      }

      certification.certificateNumber = certificateNumber;
      certification.expiryDate = new Date(expiryDate);
      certification.verifiedAt = new Date();
    }

    // Save the changes
    await certification.save();

    // Return the updated certification
    return NextResponse.json({
      message: `Certification ${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "updated"} successfully`,
      certification,
    });
  } catch (error) {
    console.error("Error updating halal certification:", error);
    return NextResponse.json(
      { message: "Failed to update halal certification", error: error.message },
      { status: 500 }
    );
  }
}
