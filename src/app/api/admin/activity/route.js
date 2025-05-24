import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/config';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Mosque from '@/models/Mosque';
import Business from '@/models/Business';
import Volunteer from '@/models/Volunteer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get recent activities from different collections
    const [recentUsers, recentMosques, recentBusinesses, recentVolunteers] = await Promise.all([
      User.find()
        .select('name email createdAt role')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Mosque.find()
        .select('name status createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      Business.find()
        .select('name createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Volunteer.find()
        .select('name createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Combine and format activities
    const activities = [];

    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registered',
        description: `${user.name} registered as ${user.role}`,
        timestamp: new Date(user.createdAt).toLocaleDateString(),
        createdAt: user.createdAt
      });
    });

    // Add mosque activities
    recentMosques.forEach(mosque => {
      if (mosque.status === 'approved') {
        activities.push({
          type: 'mosque_approved',
          description: `Mosque "${mosque.name}" was approved`,
          timestamp: new Date(mosque.updatedAt).toLocaleDateString(),
          createdAt: mosque.updatedAt
        });
      } else if (mosque.status === 'rejected') {
        activities.push({
          type: 'mosque_rejected',
          description: `Mosque "${mosque.name}" was rejected`,
          timestamp: new Date(mosque.updatedAt).toLocaleDateString(),
          createdAt: mosque.updatedAt
        });
      } else {
        activities.push({
          type: 'mosque_pending',
          description: `Mosque "${mosque.name}" submitted for review`,
          timestamp: new Date(mosque.createdAt).toLocaleDateString(),
          createdAt: mosque.createdAt
        });
      }
    });

    // Add business registrations
    recentBusinesses.forEach(business => {
      activities.push({
        type: 'business_registered',
        description: `Business "${business.name}" registered`,
        timestamp: new Date(business.createdAt).toLocaleDateString(),
        createdAt: business.createdAt
      });
    });

    // Add volunteer applications
    recentVolunteers.forEach(volunteer => {
      activities.push({
        type: 'volunteer_applied',
        description: `${volunteer.name} applied as volunteer`,
        timestamp: new Date(volunteer.createdAt).toLocaleDateString(),
        createdAt: volunteer.createdAt
      });
    });

    // Sort by most recent and limit to 20
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = activities.slice(0, 20);

    return NextResponse.json(recentActivity);

  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
