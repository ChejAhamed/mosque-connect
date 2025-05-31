import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';
import Offer from '@/models/Offer';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role with database fallback
    let userRole = session.user.role;
    if (!userRole) {
      await connectDB();
      const user = await User.findById(session.user.id);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      userRole = user.role;
    }

    if (userRole !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // Find business
    const business = await Business.findOne({ owner: session.user.id }).lean();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Fetch all data in parallel
    const [products, offers] = await Promise.all([
      Product.find({ businessId: business._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Offer.find({ 
        businessId: business._id, 
        status: 'active',
        validUntil: { $gte: new Date() }
      })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()
    ]);

    // Calculate stats
    const stats = {
      totalProducts: await Product.countDocuments({ businessId: business._id }),
      activeProducts: await Product.countDocuments({ businessId: business._id, status: 'active' }),
      totalOffers: await Offer.countDocuments({ businessId: business._id }),
      activeOffers: offers.length,
      totalOrders: 0, // Implement when you add orders
      totalRevenue: 0, // Implement when you add orders
      totalViews: business.stats?.views || 0,
      averageRating: business.stats?.averageRating || 0
    };

    return NextResponse.json({
      business,
      stats,
      recentProducts: products,
      activeOffers: offers,
      message: 'Dashboard data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}