import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/db';
import connectDB from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';
import Offer from '@/models/Offer';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get comprehensive analytics
    const [
      productStats,
      offerStats,
      monthlyProductCreation,
      categoryPerformance,
      inventoryStatus
    ] = await Promise.all([
      // Product statistics
      Product.aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalViews: { $sum: '$stats.views' },
            totalOrders: { $sum: '$stats.orders' },
            totalRevenue: { $sum: '$stats.revenue' },
            averagePrice: { $avg: '$price' }
          }
        }
      ]),

      // Offer statistics
      Offer.aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: null,
            totalOffers: { $sum: 1 },
            activeOffers: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalUsage: { $sum: '$usedCount' }
          }
        }
      ]),

      // Monthly product creation trend
      Product.aggregate([
        {
          $match: {
            businessId: business._id,
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$stats.revenue' },
            views: { $sum: '$stats.views' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Category performance
      Product.aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalViews: { $sum: '$stats.views' },
            totalOrders: { $sum: '$stats.orders' },
            totalRevenue: { $sum: '$stats.revenue' },
            averagePrice: { $avg: '$price' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]),

      // Inventory status
      Product.aggregate([
        { $match: { businessId: business._id, status: 'active' } },
        {
          $group: {
            _id: null,
            inStock: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$inventory.unlimited', true] },
                      { $gt: ['$inventory.stock', '$inventory.lowStockThreshold'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$inventory.unlimited', false] },
                      { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] },
                      { $gt: ['$inventory.stock', 0] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$inventory.unlimited', false] },
                      { $eq: ['$inventory.stock', 0] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    // Process monthly data for charts
    const monthlyStats = monthlyProductCreation.map(item => {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        products: item.count,
        revenue: item.revenue || 0,
        views: item.views || 0
      };
    });

    // Prepare response data
    const stats = {
      totalProducts: productStats[0]?.totalProducts || 0,
      totalOrders: productStats[0]?.totalOrders || 0,
      totalRevenue: productStats[0]?.totalRevenue || 0,
      totalViews: productStats[0]?.totalViews || 0,
      averagePrice: productStats[0]?.averagePrice || 0,
      activeProducts: productStats[0]?.activeProducts || 0,
      
      totalOffers: offerStats[0]?.totalOffers || 0,
      activeOffers: offerStats[0]?.activeOffers || 0,
      totalOfferUsage: offerStats[0]?.totalUsage || 0,
      
      inventoryStatus: inventoryStatus[0] || { inStock: 0, lowStock: 0, outOfStock: 0 },
      monthlyStats,
      categoryBreakdown: categoryPerformance
    };

    // Get top performing products
    const topProducts = await Product.find({ businessId: business._id })
      .sort({ 'stats.revenue': -1, 'stats.views': -1 })
      .limit(10)
      .select('name price stats category')
      .lean();

    // Get recent orders/activity (if you have an orders model)
    const recentActivity = await Product.find({ businessId: business._id })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('name updatedAt status')
      .lean();

    return NextResponse.json({
      stats,
      topProducts,
      recentActivity,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching business analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}