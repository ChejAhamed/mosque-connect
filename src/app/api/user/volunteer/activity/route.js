import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import VolunteerApplication from '@/models/VolunteerApplication';
import VolunteerOffer from '@/models/VolunteerOffer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;

    // Get activity from applications and offers
    const [applications, offers] = await Promise.all([
      VolunteerApplication.find({ userId: session.user.id })
        .populate('mosqueId', 'name')
        .sort({ createdAt: -1 })
        .lean(),
      VolunteerOffer.find({ userId: session.user.id, isGeneralOffer: true })
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Create activity timeline
    const activity = [];

    // Add application activities
    applications.forEach(app => {
      activity.push({
        type: 'application_submitted',
        title: 'Application Submitted',
        description: `Applied to volunteer at ${app.mosqueId?.name || 'Unknown Mosque'} for ${app.category}`,
        createdAt: app.createdAt,
        metadata: {
          mosqueId: app.mosqueId?._id,
          mosqueName: app.mosqueId?.name,
          category: app.category,
          status: app.status
        }
      });

      if (app.status === 'accepted' && app.updatedAt > app.createdAt) {
        activity.push({
          type: 'application_accepted',
          title: 'Application Accepted',
          description: `Your volunteer application to ${app.mosqueId?.name || 'Unknown Mosque'} was accepted`,
          createdAt: app.updatedAt,
          metadata: {
            mosqueId: app.mosqueId?._id,
            mosqueName: app.mosqueId?.name,
            category: app.category
          }
        });
      }

      if (app.status === 'rejected' && app.updatedAt > app.createdAt) {
        activity.push({
          type: 'application_rejected',
          title: 'Application Rejected',
          description: `Your volunteer application to ${app.mosqueId?.name || 'Unknown Mosque'} was rejected`,
          createdAt: app.updatedAt,
          metadata: {
            mosqueId: app.mosqueId?._id,
            mosqueName: app.mosqueId?.name,
            category: app.category
          }
        });
      }
    });

    // Add offer activities
    offers.forEach(offer => {
      activity.push({
        type: 'offer_created',
        title: 'Volunteer Offer Created',
        description: `Created general volunteer offer: ${offer.title}`,
        createdAt: offer.createdAt,
        metadata: {
          offerId: offer._id,
          title: offer.title,
          category: offer.category,
          status: offer.status
        }
      });

      if (offer.updatedAt > offer.createdAt) {
        activity.push({
          type: 'offer_updated',
          title: 'Volunteer Offer Updated',
          description: `Updated volunteer offer: ${offer.title}`,
          createdAt: offer.updatedAt,
          metadata: {
            offerId: offer._id,
            title: offer.title,
            category: offer.category,
            status: offer.status
          }
        });
      }
    });

    // Sort by date (newest first)
    activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedActivity = activity.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      activity: paginatedActivity,
      pagination: {
        current: page,
        total: Math.ceil(activity.length / limit),
        count: paginatedActivity.length,
        totalItems: activity.length
      }
    });

  } catch (error) {
    console.error('Error fetching volunteer activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch volunteer activity' },
      { status: 500 }
    );
  }
}