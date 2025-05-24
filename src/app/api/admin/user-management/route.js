import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET /api/admin/user-management
// Fetch all admin users
export async function GET(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Build query - only fetch admin and super_admin users
    const query = {
      role: { $in: ["admin", "super_admin"] }
    };

    // If user is not super_admin, they can only see regular admins
    if (session.user.role !== "super_admin") {
      query.role = "admin";
    }

    // Fetch admin users (excluding sensitive fields)
    const admins = await User.find(query)
      .select("-password -__v")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      admins,
      count: admins.length,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { message: "Failed to fetch admin users", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/user-management
// Create a new admin user
export async function POST(request) {
  try {
    // Check authentication and permission
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { name, email, password, role, permissions } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate role assignment permissions
    if (role === "super_admin" && session.user.role !== "super_admin") {
      return NextResponse.json(
        { message: "Only super admins can create super admin accounts" },
        { status: 403 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create default permissions if not provided
    const defaultPermissions = {
      mosques: { read: true, write: role === "super_admin", delete: role === "super_admin" },
      volunteers: { read: true, write: role === "super_admin", delete: role === "super_admin" },
      businesses: { read: true, write: role === "super_admin", delete: role === "super_admin" },
      halal_certifications: { read: true, write: true, delete: role === "super_admin" },
      users: { read: role === "super_admin", write: role === "super_admin", delete: role === "super_admin" },
      settings: { read: role === "super_admin", write: role === "super_admin", delete: role === "super_admin" }
    };

    // Create the new admin user
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "admin",
      permissions: permissions || defaultPermissions,
      isActive: true,
      createdBy: session.user.id,
      createdAt: new Date()
    });

    await newAdmin.save();

    // Remove password from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    // Log the activity
    await logAdminActivity({
      adminId: session.user.id,
      adminName: session.user.name,
      action: "CREATE_ADMIN",
      module: "user_management",
      details: `Created new admin user: ${name} (${email})`,
      targetId: newAdmin._id
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { message: "Failed to create admin user", error: error.message },
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
