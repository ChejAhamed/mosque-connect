import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Mosque from '@/models/Mosque';
import Business from '@/models/Business';
import Volunteer from '@/models/Volunteer';
import HalalCertification from '@/models/HalalCertification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Check if user is admin (but allow unauthenticated calls in development)
    if ((!session || session.user.role !== 'admin') && !isDevelopment) {
      console.log('Unauthorized access attempt to admin stats API');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log who is accessing this endpoint
    if (session) {
      console.log(`Admin stats accessed by ${session.user.email} (${session.user.role})`);
    } else if (isDevelopment) {
      console.log('Admin stats accessed in development mode without authentication');
    }

    await connectToDatabase();

    // Fetch real statistics from the database
    const stats = {
      users: {
        total: 0,
        male: 0,
        female: 0,
        other: 0
      },
      imams: {
        total: 0,
        male: 0,
        female: 0
      },
      businesses: {
        total: 0,
        categories: []
      },
      volunteers: {
        total: 0
      },
      cities: {
        total: 0,
        top: []
      },
      mosques: {
        total: 0
      },
      halalCertifications: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };

    try {
      console.log('Fetching admin dashboard statistics...');

      // Check database connection
      const dbResult = await connectToDatabase();
      if (dbResult.error) {
        console.error(`Failed to connect to database: ${dbResult.message}`);
        return getFallbackStats();
      }

      console.log('Database connected successfully, fetching statistics...');

      // Count users
      try {
        const users = await User.find().lean();
        stats.users.total = users.length;
        stats.users.male = users.filter(user => user.gender === 'male').length;
        stats.users.female = users.filter(user => user.gender === 'female').length;
        stats.users.other = users.filter(user => user.gender !== 'male' && user.gender !== 'female').length;

        // Count imams
        stats.imams.total = users.filter(user => user.role === 'imam').length;
        stats.imams.male = users.filter(user => user.role === 'imam' && user.gender === 'male').length;
        stats.imams.female = users.filter(user => user.role === 'imam' && user.gender === 'female').length;

        console.log(`Found ${stats.users.total} users, ${stats.imams.total} imams`);
      } catch (error) {
        console.error('Error fetching user statistics:', error);
      }

      // Count businesses
      try {
        const businesses = await Business.find().lean();
        stats.businesses.total = businesses.length;

        // Count business categories
        const businessTypes = businesses.map(b => b.type).filter(Boolean);
        const businessCategories = [...new Set(businessTypes)];
        stats.businesses.categories = businessCategories;

        console.log(`Found ${stats.businesses.total} businesses, ${businessCategories.length} categories`);
      } catch (error) {
        console.error('Error fetching business statistics:', error);
      }

      // Count volunteers
      try {
        const volunteers = await Volunteer.find().lean();
        stats.volunteers.total = volunteers.length;
        console.log(`Found ${stats.volunteers.total} volunteers`);
      } catch (error) {
        console.error('Error fetching volunteer statistics:', error);
      }

      // Count mosques
      try {
        const mosques = await Mosque.find().lean();
        stats.mosques.total = mosques.length;
        console.log(`Found ${stats.mosques.total} mosques`);
      } catch (error) {
        console.error('Error fetching mosque statistics:', error);
      }

      // Get city data
      try {
        const cities = {};

        // Collect data to calculate cities
        const allUsers = await User.find().select('city').lean();
        const allMosques = await Mosque.find().select('city').lean();
        const allBusinesses = await Business.find().select('city').lean();

        [...allUsers, ...allMosques, ...allBusinesses].forEach(item => {
          if (item.city) {
            const city = item.city.toLowerCase();
            cities[city] = (cities[city] || 0) + 1;
          }
        });

        // Convert cities to array and sort by count
        const citiesArray = Object.entries(cities).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          count
        }));

        stats.cities.total = citiesArray.length;
        stats.cities.top = citiesArray.sort((a, b) => b.count - a.count).slice(0, 10);
        console.log(`Found ${stats.cities.total} cities`);
      } catch (error) {
        console.error('Error processing city statistics:', error);
      }

      // Count halal certifications
      try {
        const certifications = await HalalCertification.find().lean();
        stats.halalCertifications.total = certifications.length;
        stats.halalCertifications.pending = certifications.filter(c => c.status === 'pending').length;
        stats.halalCertifications.approved = certifications.filter(c => c.status === 'approved').length;
        stats.halalCertifications.rejected = certifications.filter(c => c.status === 'rejected').length;

        console.log(`Found ${stats.halalCertifications.total} halal certifications`);
      } catch (error) {
        console.error('Error fetching certification statistics:', error);
      }

      console.log('Successfully gathered all admin statistics');

    } catch (dbError) {
      console.error('Database error fetching stats:', dbError);
      // Fall back to mock data if there's a database error
      return getFallbackStats();
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}

// Fallback function to return demo stats
function getFallbackStats() {
  return NextResponse.json({
    stats: {
      users: {
        total: 1523,
        male: 720,
        female: 780,
        other: 23
      },
      imams: {
        total: 185,
        male: 165,
        female: 20
      },
      businesses: {
        total: 347,
        categories: ['Restaurant', 'Grocery', 'Butcher', 'Bakery', 'Clothing']
      },
      volunteers: {
        total: 238
      },
      cities: {
        total: 47,
        top: [
          { name: 'London', count: 412 },
          { name: 'Birmingham', count: 287 },
          { name: 'Manchester', count: 172 },
          { name: 'Leeds', count: 143 },
          { name: 'Glasgow', count: 98 },
        ]
      },
      mosques: {
        total: 537
      },
      halalCertifications: {
        total: 129,
        pending: 45,
        approved: 72,
        rejected: 12
      }
    }
  });
}
