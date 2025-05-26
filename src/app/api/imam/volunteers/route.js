import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authConfig from '@/app/api/auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import { VolunteerApplication } from '@/models/VolunteerApplication';
import { VolunteerOffer } from '@/models/VolunteerOffer';

export async function GET(request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'imam' && session.user.role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const mosqueId = searchParams.get('mosqueId');
    const type = searchParams.get('type'); // 'applications' or 'general-offers'
    
    if (!mosqueId) {
      return NextResponse.json(
        { success: false, message: 'Mosque ID is required' },
        { status: 400 }
      );
    }

    let data = {};

    // Get mosque-specific applications
    if (!type || type === 'applications') {
      const applications = await VolunteerApplication.find({ mosqueId })
        .populate('userId', 'name email phone city')
        .populate('mosqueResponse.respondedBy', 'name email')
        .sort({ createdAt: -1 });
      
      data.applications = applications;
    }

    // Get general volunteer offers (available to all mosques)
    if (!type || type === 'general-offers') {
      const generalOffers = await VolunteerOffer.find({ 
        isGeneralOffer: true, 
        status: 'active',
        targetMosqueId: null 
      })
        .populate('userId', 'name email phone city')
        .sort({ createdAt: -1 });
      
      data.generalOffers = generalOffers;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching volunteers for imam:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch volunteers' },
      { status: 500 }
    );
  }
}