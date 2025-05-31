'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import {
  ArrowLeft,
  Store,
  Tag,
  Package,
  Star,
  Eye,
  ShoppingCart,
  Share2,
  Heart,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  Truck,
  RotateCcw
} from 'lucide-react';

export default function ProductDetail({ params }) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [business, setBusiness] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductData();
  }, [params.businessId, params.productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      
      // Track product view
      await axios.post(`/api/shop/${params.businessId}/products/${params.productId}/view`);
      
      const [productRes, businessRes, relatedRes] = await Promise.all([
        axios.get(`/api/shop/${params.businessId}/products/${params.productId}`),
        axios.get(`/api/shop/${params.businessId}`),
        axios.get(`/api/shop/${params.businessId}/products?limit=4&category=${productRes?.data?.product?.category}`)
      ]);

      setProduct(productRes.data.product);
      setBusiness(businessRes.data.business);
      
      // Filter out current product from related products
      const related = relatedRes.data.products?.filter(p => p._id !== params.productId) || [];
      setRelatedProducts(related);

    } catch (error) {
      console.error('Error fetching product data:', error);
      toast({
        title: "Error",
        description: "Failed to load product information",
        variant: "destructive"
      });
      
      if (error.response?.status === 404) {
        router.push(`/shop/${params.businessId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${product.name} - ${business.name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Success",
          description: "Product link copied to clipboard"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  const getAvailabilityStatus = () => {
    if (product.status !== 'active') {
      return { status: 'unavailable', text: 'Unavailable', color: 'text-red-600' };
    }
    
    if (!product.inventory.unlimited && product.inventory.trackInventory) {
      if (product.inventory.stock <= 0) {
        return { status: 'out_of_stock', text: 'Out of Stock', color: 'text-red-600' };
      }
      
      if (product.inventory.stock <= product.inventory.lowStockThreshold) {
        return { status: 'low_stock', text: `Only ${product.inventory.stock} left`, color: 'text-orange-600' };
      }
    }
    
    return { status: 'in_stock', text: 'In Stock', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (!product || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or is no longer available.</p>
            <Link href={`/shop/${params.businessId}`}>
              <Button>Back to Store</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/shop" className="hover:text-blue-600">Shops</Link>
          <span>/</span>
          <Link href={`/shop/${params.businessId}`} className="hover:text-blue-600">
            {business.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg border overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.url || product.images[0]?.url}
                  alt={product.images[selectedImage]?.alt || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Business Info */}
              <Link 
                href={`/shop/${params.businessId}`}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 mb-4"
              >
                <Store className="h-4 w-4" />
                <span>Sold by {business.name}</span>
              </Link>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                {product.compareAtPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.compareAtPrice}
                  </span>
                )}
                {product.discountPercentage > 0 && (
                  <Badge className="bg-red-600">
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center space-x-2 mb-4">
                <div className={`flex items-center space-x-1 ${availability.color}`}>
                  {availability.status === 'in_stock' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="font-medium">{availability.text}</span>
                </div>
              </div>

              {/* Category and Tags */}
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="outline">{product.category}</Badge>
                {product.subcategory && (
                  <Badge variant="outline">{product.subcategory}</Badge>
                )}
              </div>

              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).some(key => 
              key !== 'custom' && product.specifications[key]
            ) && (
              <div>
                <h3 className="font-semibold mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => {
                    if (key === 'custom' || !value) return null;
                    return (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    );
                  })}
                  
                  {/* Custom specifications */}
                  {product.specifications.custom?.map((spec, index) => (
                    <div key={index} className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">{spec.name}:</span>
                      <span className="font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability Options */}
            <div>
              <h3 className="font-semibold mb-3">Availability</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  {product.availability.inStore ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span>In Store</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {product.availability.pickup ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span>Pickup Available</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {product.availability.delivery ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span>Delivery Available</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {product.availability.online ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                  <span>Online Ordering</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {business.settings?.acceptsOrders ? (
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={availability.status === 'out_of_stock' || availability.status === 'unavailable'}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {availability.status === 'out_of_stock' ? 'Out of Stock' : 'Contact to Order'}
                </Button>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Contact the store directly to inquire about this product</p>
                </div>
              )}
            </div>

            {/* Product Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 pt-4 border-t">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{product.stats?.views || 0} views</span>
              </div>
              
              {product.stats?.orders > 0 && (
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{product.stats.orders} orders</span>
                </div>
              )}
              
              {product.stats?.averageRating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{product.stats.averageRating.toFixed(1)} ({product.stats.totalReviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">{business.name}</h4>
                <p className="text-gray-600 mb-3">{business.description}</p>
                
                {business.contact?.address && (
                  <div className="flex items-start space-x-2 mb-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                    <div className="text-sm">
                      <p>{business.contact.address.street}</p>
                      <p>{business.contact.address.city}, {business.contact.address.state}</p>
                    </div>
                  </div>
                )}
                
                {business.contact?.phone && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${business.contact.phone}`} className="text-sm hover:text-blue-600">
                      {business.contact.phone}
                    </a>
                  </div>
                )}
                
                {business.contact?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${business.contact.email}`} className="text-sm hover:text-blue-600">
                      {business.contact.email}
                    </a>
                  </div>
                )}
              </div>
              
              <div>
                <Link href={`/shop/${params.businessId}`}>
                  <Button variant="outline" className="w-full">
                    Visit Store
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Related Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link 
                    key={relatedProduct._id} 
                    href={`/shop/${params.businessId}/product/${relatedProduct._id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gray-100">
                        {relatedProduct.primaryImage ? (
                          <img
                            src={relatedProduct.primaryImage.url}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">{relatedProduct.name}</h4>
                        <p className="text-lg font-bold text-gray-900">${relatedProduct.price}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}