import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Get file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload JPEG, PNG, WebP or PDF.' },
        { status: 400 }
      );
    }

    // Create unique filename
    const uniqueId = uuidv4();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const fileName = `${uniqueId}-${originalName}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Write file to disk
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Return the file URL
    const fileUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
