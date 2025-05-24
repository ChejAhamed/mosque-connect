import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET /api/admin/user-management/[adminId]
// Get a specific admin user by ID
export async function GET(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { adminId } = params;
    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the admin user
    const admin = await User.findById(adminId)
      .select("-password -__v")
      .lean();

    if (!admin) {
      return NextResponse.json(
        { message: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this admin
    if (session.user.role !== "super_admin" && admin.role === "super_admin") {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return NextResponse.json(
      { message: "Failed to fetch admin user", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/user-management/[adminId]
// Update an admin user
export async function PATCH(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { adminId } = params;
    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { name, email, password, role, permissions, isActive } = body;

    // Connect to the database
    await dbConnect();

    // Find the admin user
    const admin = await User.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check permissions for updating this admin
    if (session.user.role !== "super_admin" && admin.role === "super_admin") {
      return NextResponse.json(
        { message: "Insufficient permissions to update super admin" },
        { status: 403 }
      );
    }

    // Check permissions for role changes
    if (role && role !== admin.role) {
      if (role === "super_admin" && session.user.role !== "super_admin") {
        return NextResponse.json(
          { message: "Only super admins can promote users to super admin" },
          { status: 403 }
        );
      }

      if (admin.role === "super_admin" && session.user.role !== "super_admin") {
        return NextResponse.json(
          { message: "Only super admins can demote super admins" },
          { status: 403 }
        );
      }
    }

    // Prevent self-deletion or role changes
    if (adminId === session.user.id && (role && role !== admin.role)) {
      return NextResponse.json(
        { message: "Cannot change your own role" },
        { status: 400 }
      );
    }

    // Update fields
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        email,
        _id: { $ne: adminId }
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already taken by another user" },
          { status: 400 }
        );
      }

      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    if (role) updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;

    updateData.updatedAt = new Date();
    updateData.updatedBy = session.user.id;

    // Update the admin user
    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, select: "-password -__v" }
    ).lean();

    // Log the activity
    await logAdminActivity({
      adminId: session.user.id,
      adminName: session.user.name,
      action: "UPDATE_ADMIN",
      module: "user_management",
      details: `Updated admin user: ${updatedAdmin.name} (${updatedAdmin.email})`,
      targetId: adminId,
      changes: Object.keys(updateData)
    });

    return NextResponse.json({
      message: "Admin user updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    return NextResponse.json(
      { message: "Failed to update admin user", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/user-management/[adminId]
// Delete an admin user
export async function DELETE(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { adminId } = params;
    if (!adminId) {
      return NextResponse.json(
        { message: "Admin ID is required" },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (adminId === session.user.id) {
      return NextResponse.json(
        { message: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the admin user
    const admin = await User.findById(adminId);
    if (!admin) {
      return NextResponse.json(
        { message: "Admin user not found" },
        { status: 404 }
      );
    }

    // Check permissions for deleting this admin
    if (session.user.role !== "super_admin" && admin.role === "super_admin") {
      return NextResponse.json(
        { message: "Insufficient permissions to delete super admin" },
        { status: 403 }
      );
    }

    // Store admin info for logging before deletion
    const adminInfo = {
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    // Delete the admin user
    await User.findByIdAndDelete(adminId);

    // Log the activity
    await logAdminActivity({
      adminId: session.user.id,
      adminName: session.user.name,
      action: "DELETE_ADMIN",
      module: "user_management",
      details: `Deleted admin user: ${adminInfo.name} (${adminInfo.email})`,
      targetId: adminId
    });

    return NextResponse.json({
      message: "Admin user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return NextResponse.json(
      { message: "Failed to delete admin user", error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to log admin activities
async function logAdminActivity(activityData) {
  try {
    // You can implement this to store in a separate ActivityLog model
    // For now, we'll just log to console
    console.log("Admin Activity:", activityData);

    // TODO: Implement ActivityLog model and save to database
    // const activityLog = new ActivityLog(activityData);
    // await activityLog.save();
  } catch (error) {
    console.error("Error logging admin activity:", error);
  }
}
