import { NextResponse } from "next/server";

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

// This is a catch-all API handler for static exports
export async function GET() {
  return NextResponse.json(
    {
      message: "API routes are not available in the static export. This is a mock response.",
      success: false
    },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      message: "API routes are not available in the static export. This is a mock response.",
      success: false
    },
    { status: 200 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      message: "API routes are not available in the static export. This is a mock response.",
      success: false
    },
    { status: 200 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      message: "API routes are not available in the static export. This is a mock response.",
      success: false
    },
    { status: 200 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      message: "API routes are not available in the static export. This is a mock response.",
      success: false
    },
    { status: 200 }
  );
}
