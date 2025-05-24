import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Volunteer from "@/models/Volunteer";

// GET /api/admin/volunteers/[volunteerId]
// Fetch a specific volunteer by ID
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

    const { volunteerId } = params;
    if (!volunteerId) {
      return NextResponse.json(
        { message: "Volunteer ID is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the volunteer
    const volunteer = await Volunteer.findById(volunteerId)
      .populate("userId", "name email image")
      .lean();

    if (!volunteer) {
      return NextResponse.json(
        { message: "Volunteer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ volunteer });
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    return NextResponse.json(
      { message: "Failed to fetch volunteer", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/volunteers/[volunteerId]
// Update a volunteer's status, notes, or assignment
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

    const { volunteerId } = params;
    if (!volunteerId) {
      return NextResponse.json(
        { message: "Volunteer ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { status, notes, currentAssignment } = body;

    // Connect to the database
    await dbConnect();

    // Find the volunteer
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return NextResponse.json(
        { message: "Volunteer not found" },
        { status: 404 }
      );
    }

    // Update the volunteer
    if (status) {
      volunteer.status = status;
      volunteer.reviewedAt = new Date();
      volunteer.reviewedBy = session.user.id;
      volunteer.reviewerName = session.user.name;
    }

    if (notes) {
      volunteer.notes = notes;
    }

    // Update assignment information
    if (currentAssignment) {
      volunteer.currentAssignment = currentAssignment;
      volunteer.assignmentDate = body.assignmentDate || new Date();
      volunteer.assignedBy = session.user.id;
      volunteer.assignerName = session.user.name;
    }

    // Clear assignment if specified
    if (body.clearAssignment) {
      volunteer.currentAssignment = null;
      volunteer.assignmentDate = null;
    }

    // Save the changes
    await volunteer.save();

    return NextResponse.json({
      message: "Volunteer updated successfully",
      volunteer,
    });
  } catch (error) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json(
      { message: "Failed to update volunteer", error: error.message },
      { status: 500 }
    );
  }
}
