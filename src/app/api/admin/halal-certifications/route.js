import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import HalalCertification from "@/models/HalalCertification";

// GET /api/admin/halal-certifications
// Fetch all halal certifications with optional filters
export async function GET(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const businessName = searchParams.get("businessName");
    const businessType = searchParams.get("businessType");

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (businessName) {
      query.businessName = { $regex: businessName, $options: "i" };
    }

    if (businessType) {
      query.businessType = { $regex: businessType, $options: "i" };
    }

    // Fetch certifications
    const certifications = await HalalCertification.find(query)
      .sort({ updatedAt: -1 })
      .populate("businessId", "name type address city")
      .lean();

    return NextResponse.json({
      certifications,
      count: certifications.length,
    });
  } catch (error) {
    console.error("Error fetching halal certifications:", error);
    return NextResponse.json(
      { message: "Failed to fetch halal certifications", error: error.message },
      { status: 500 }
    );
  }
}
