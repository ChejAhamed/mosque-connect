import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";

// GET /api/admin/activity-logs
// Fetch admin activity logs
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 100;
    const module = searchParams.get("module");
    const adminId = searchParams.get("adminId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // For now, we'll return mock data since ActivityLog model isn't implemented yet
    // TODO: Replace with actual database query when ActivityLog model is created
    const mockLogs = [
      {
        _id: "1",
        adminId: session.user.id,
        adminName: session.user.name,
        action: "APPROVE_MOSQUE",
        module: "mosques",
        details: "Approved mosque registration for Al-Noor Mosque",
        targetId: "mosque_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        _id: "2",
        adminId: session.user.id,
        adminName: session.user.name,
        action: "APPROVE_VOLUNTEER",
        module: "volunteers",
        details: "Approved volunteer application for Ahmed Ali",
        targetId: "volunteer_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        _id: "3",
        adminId: session.user.id,
        adminName: session.user.name,
        action: "REJECT_BUSINESS",
        module: "businesses",
        details: "Rejected business registration for XYZ Restaurant - incomplete documentation",
        targetId: "business_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        _id: "4",
        adminId: session.user.id,
        adminName: session.user.name,
        action: "APPROVE_HALAL_CERTIFICATION",
        module: "halal_certifications",
        details: "Approved halal certification for Halal Family Restaurant",
        targetId: "cert_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        _id: "5",
        adminId: session.user.id,
        adminName: session.user.name,
        action: "CREATE_ADMIN",
        module: "user_management",
        details: "Created new admin user: John Doe (john@example.com)",
        targetId: "admin_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        _id: "6",
        adminId: session.user.id,
        adminName: session.user.name,
        action: "UPDATE_SETTINGS",
        module: "settings",
        details: "Updated platform notification settings",
        targetId: "settings_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      }
    ];

    // Apply filters to mock data
    let filteredLogs = mockLogs;

    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    if (adminId) {
      filteredLogs = filteredLogs.filter(log => log.adminId === adminId);
    }

    if (startDate) {
      const start = new Date(startDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= end);
    }

    // Limit results
    filteredLogs = filteredLogs.slice(0, limit);

    return NextResponse.json({
      logs: filteredLogs,
      count: filteredLogs.length,
      total: mockLogs.length
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      { message: "Failed to fetch activity logs", error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/activity-logs
// Create a new activity log entry
export async function POST(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { action, module, details, targetId } = body;

    // Validate required fields
    if (!action || !module || !details) {
      return NextResponse.json(
        { message: "Action, module, and details are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Create activity log entry
    const activityData = {
      adminId: session.user.id,
      adminName: session.user.name,
      action,
      module,
      details,
      targetId,
      timestamp: new Date(),
      ipAddress: request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 request.ip ||
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // TODO: Save to ActivityLog model when implemented
    // const activityLog = new ActivityLog(activityData);
    // await activityLog.save();

    console.log("Activity logged:", activityData);

    return NextResponse.json({
      message: "Activity logged successfully",
      log: activityData
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    return NextResponse.json(
      { message: "Failed to create activity log", error: error.message },
      { status: 500 }
    );
  }
}
