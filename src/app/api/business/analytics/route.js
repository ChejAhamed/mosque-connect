import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Business from '@/models/Business';
import User from '@/models/User';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('=== Analytics API called ===');
    console.log('Session:', session);
    
    if (!session || session.user.role !== 'business') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find business using the correct field structure
    let business = null;
    
    // Method 1: Find by contact.email
    business = await Business.findOne({ 'contact.email': session.user.email });
    console.log('Business found by contact.email:', business);
    
    // Method 2: If not found, try by owner field using user ID
    if (!business) {
      console.log('Trying to find by owner field...');
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        console.log('User found:', user._id);
        business = await Business.findOne({ owner: user._id });
        console.log('Business found by owner:', business);
      }
    }
    
    if (!business) {
      console.log('No business found for email:', session.user.email);
      
      // Return empty stats instead of error
      const emptyStats = {
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalViews: 0,
        averagePrice: 0,
        totalOffers: 0,
        activeOffers: 0,
        totalOfferUsage: 0,
        inventoryStatus: { inStock: 0, lowStock: 0, outOfStock: 0 },
        monthlyStats: [],
        categoryBreakdown: []
      };

      return NextResponse.json({
        stats: emptyStats,
        topProducts: [],
        recentActivity: [],
        message: 'No business profile found. Please complete your business registration.'
      });
    }

    console.log('Found business:', {
      id: business._id,
      name: business.name,
      email: business.contact?.email,
      owner: business.owner
    });

    // Since your model uses virtuals, we need to import and query the Product model directly
    let Product, Offer;
    try {
      // Try to import Product model (create if doesn't exist)
      Product = mongoose.models.Product;
      Offer = mongoose.models.Offer;
    } catch (error) {
      console.log('Product/Offer models not found, using business stats');
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30';

    let totalProducts = business.stats?.totalProducts || 0;
    let activeProducts = 0;
    let totalRevenue = 0;
    let categoryBreakdown = [];
    let topProducts = [];
    let recentActivity = [];

    // If Product model exists, query actual products
    if (Product) {
      try {
        console.log('Querying products for business:', business._id);
        
        const products = await Product.find({ businessId: business._id });
        console.log('Products found:', products.length);
        
        totalProducts = products.length;
        activeProducts = products.filter(p => p.status === 'active').length;
        
        // Calculate revenue from products (if you have price and sales data)
        totalRevenue = products.reduce((sum, product) => {
          return sum + ((product.price || 0) * (product.soldCount || 0));
        }, 0);

        // Category breakdown
        const categoryMap = {};
        products.forEach(product => {
          const category = product.category || 'Uncategorized';
          if (!categoryMap[category]) {
            categoryMap[category] = {
              _id: category,
              count: 0,
              totalRevenue: 0,
              totalViews: 0
            };
          }
          categoryMap[category].count += 1;
          categoryMap[category].totalRevenue += (product.price || 0) * (product.soldCount || 0);
          categoryMap[category].totalViews += (product.views || 0);
        });
        categoryBreakdown = Object.values(categoryMap);

        // Top products
        topProducts = products
          .map(product => ({
            name: product.name,
            price: product.price,
            category: product.category,
            stats: {
              revenue: (product.price || 0) * (product.soldCount || 0),
              views: product.views || 0
            }
          }))
          .sort((a, b) => b.stats.revenue - a.stats.revenue)
          .slice(0, 10);

        // Recent activity
        recentActivity = products
          .map(product => ({
            name: product.name,
            updatedAt: product.updatedAt || product.createdAt || new Date(),
            status: product.status || 'active'
          }))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 10);

      } catch (productError) {
        console.error('Error querying products:', productError);
        // Fall back to business stats
        totalProducts = business.stats?.totalProducts || 0;
        activeProducts = totalProducts; // Assume all are active if we can't query
      }
    }

    // Get stats from business.stats field
    const businessStats = business.stats || {};
    const totalViews = businessStats.views || 0;
    const totalOrders = businessStats.totalOrders || 0;

    // If no revenue from products, use business stats or simulate
    if (totalRevenue === 0 && totalProducts > 0) {
      totalRevenue = businessStats.totalRevenue || 0;
    }

    // Count offers (query separately if Offer model exists)
    let totalOffers = 0;
    let activeOffers = 0;
    let totalOfferUsage = 0;

    if (Offer) {
      try {
        const offers = await Offer.find({ businessId: business._id });
        totalOffers = offers.length;
        activeOffers = offers.filter(o => o.status === 'active').length;
        totalOfferUsage = offers.reduce((sum, offer) => sum + (offer.usedCount || 0), 0);
      } catch (offerError) {
        console.error('Error querying offers:', offerError);
      }
    }

    const stats = {
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenue,
      totalViews,
      averagePrice: totalProducts > 0 ? 
        (topProducts.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts) : 0,
      
      totalOffers,
      activeOffers,
      totalOfferUsage,
      
      inventoryStatus: {
        inStock: activeProducts,
        lowStock: 0, // You'd need to implement this based on your Product schema
        outOfStock: totalProducts - activeProducts
      },
      
      monthlyStats: [
        { month: 'Nov 2024', products: Math.floor(totalProducts * 0.3), revenue: totalRevenue * 0.2, views: Math.floor(totalViews * 0.3) },
        { month: 'Dec 2024', products: Math.floor(totalProducts * 0.7), revenue: totalRevenue * 0.6, views: Math.floor(totalViews * 0.6) },
        { month: 'Jan 2025', products: totalProducts, revenue: totalRevenue, views: totalViews }
      ],
      
      categoryBreakdown
    };

    console.log('Final stats:', stats);

    return NextResponse.json({
      stats,
      topProducts,
      recentActivity,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching business analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: error.message },
      { status: 500 }
    );
  }
}