import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Mosque } from '@/models/Mosque';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Mosque ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const mosque = await Mosque.findById(id)
      .populate('imamId', 'name email')
      .lean();

    if (!mosque) {
      return NextResponse.json(
        { success: false, message: 'Mosque not found' },
        { status: 404 }
      );
    }

    // Convert ObjectId to string
    const mosqueData = {
      ...mosque,
      _id: mosque._id.toString(),
      imamId: mosque.imamId ? {
        ...mosque.imamId,
        _id: mosque.imamId._id.toString()
      } : null
    };

    return NextResponse.json({
      success: true,
      data: mosqueData,
    });
  } catch (error) {
    console.error('Error fetching mosque:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch mosque', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();
    
    await connectDB();
    
    const mosque = await Mosque.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('imamId', 'name email');

    if (!mosque) {
      return NextResponse.json(
        { success: false, message: 'Mosque not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mosque,
      message: 'Mosque updated successfully',
    });
  } catch (error) {
    console.error('Error updating mosque:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update mosque', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    await connectDB();
    
    const mosque = await Mosque.findByIdAndDelete(id);

    if (!mosque) {
      return NextResponse.json(
        { success: false, message: 'Mosque not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mosque deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting mosque:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete mosque', error: error.message },
      { status: 500 }
    );
  }
}