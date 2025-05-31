import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/config';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find user's business
    const business = await Business.findOne({ owner: session.user.id });
    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get comprehensive product statistics
    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      outOfStockProducts,
      lowStockProducts,
      totalInventoryValue,
      categoryBreakdown,
      recentProducts
    ] = await Promise.all([
      // Total products
      Product.countDocuments({ businessId: business._id }),
      
      // Active products
      Product.countDocuments({ businessId: business._id, status: 'active' }),
      
      // Inactive products
      Product.countDocuments({ businessId: business._id, status: 'inactive' }),
      
      // Out of stock products
      Product.countDocuments({
        businessId: business._id,
        status: 'active',
        'inventory.unlimited': false,
        'inventory.trackInventory': true,
        'inventory.stock': 0
      }),
      
      // Low stock products
      Product.aggregate([
        {
          $match: {
            businessId: business._id,
            status: 'active',
            'inventory.unlimited': false,
            'inventory.trackInventory': true
          }
        },
        {
          $match: {
            $expr: {
              $and: [
                { $gt: ['$inventory.stock', 0] },
                { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] }
              ]
            }
          }
        },
        { $count: 'lowStock' }
      ]),
      
      // Total inventory value
      Product.aggregate([
        { $match: { businessId: business._id, status: 'active' } },
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: {
                $multiply: [
                  '$price',
                  {
                    $cond: [
                      '$inventory.unlimited',
                      1,
                      { $ifNull: ['$inventory.stock', 0] }
                    ]
                  }
                ]
              }
            }
          }
        }
      ]),
      
      // Category breakdown
      Product.aggregate([
        { $match: { businessId: business._id } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            totalValue: { $sum: '$price' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Recent products (last 5)
      Product.find({ businessId: business._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name price status createdAt')
        .lean()
    ]);

    // Process results
    const lowStockCount = lowStockProducts.length > 0 ? lowStockProducts[0].lowStock : 0;
    const inventoryValue = totalInventoryValue.length > 0 ? totalInventoryValue[0].totalValue : 0;

    // Get top performing products (by views/orders if available)
    const topProducts = await Product.find({ businessId: business._id })
      .sort({ 'stats.views': -1, 'stats.orders': -1 })
      .limit(5)
      .select('name price stats')
      .lean();

    const stats = {
      total: totalProducts,
      active: activeProducts,
      inactive: inactiveProducts,
      outOfStock: outOfStockProducts,
      lowStock: lowStockCount,
      totalValue: inventoryValue,
      categoryBreakdown,
      recentProducts,
      topProducts
    };

    return NextResponse.json({
      stats,
      message: 'Product statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product statistics' },
      { status: 500 }
    );
  }
}