import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from '@/lib/db';

// For static export compatibility
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
import MosqueModel from "@/models/Mosque";

/**
 * GET handler for retrieving a single mosque by ID
 */
export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const mosque = await MosqueModel.findById(params.id);

    if (!mosque) {
      return NextResponse.json(
        { error: "Mosque not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mosque);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch mosque" },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler for updating a mosque by ID
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectToDatabase();

    const mosque = await MosqueModel.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!mosque) {
      return NextResponse.json(
        { error: "Mosque not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mosque);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to update mosque: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for removing a mosque by ID
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const mosque = await MosqueModel.findByIdAndDelete(params.id);

    if (!mosque) {
      return NextResponse.json(
        { error: "Mosque not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Mosque deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete mosque" },
      { status: 500 }
    );
  }
}
