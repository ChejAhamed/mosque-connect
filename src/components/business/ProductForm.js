'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  DollarSign,
  Tag,
  Image as ImageIcon,
  Plus,
  X,
  Save,
  Upload
} from 'lucide-react';

export function ProductForm({ 
  product = null, 
  onSubmit, 
  onCancel, 
  submitting = false, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    subcategory: '',
    images: [],
    inventory: {
      stock: '',
      unlimited: false,
      trackInventory: true,
      lowStockThreshold: '10'
    },
    status: 'active',
    featured: false,
    tags: [],
    specifications: {
      weight: '',
      dimensions: '',
      material: '',
      color: '',
      size: '',
      brand: '',
      model: '',
      warranty: '',
      custom: []
    },
    variants: [],
    availability: {
      inStore: true,
      online: true,
      delivery: false,
      pickup: true
    }
  });

  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newCustomSpec, setNewCustomSpec] = useState({ name: '', value: '' });
  const [newVariant, setNewVariant] = useState({ name: '', options: [''] });

  const productCategories = [
    'Food & Beverages',
    'Clothing & Accessories',
    'Electronics',
    'Books & Media',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Recreation',
    'Automotive',
    'Jewelry',
    'Arts & Crafts',
    'Toys & Games',
    'Services',
    'Other'
  ];

  // Load product data if editing
  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        compareAtPrice: product.compareAtPrice?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        images: product.images || [],
        inventory: {
          stock: product.inventory?.stock?.toString() || '',
          unlimited: product.inventory?.unlimited || false,
          trackInventory: product.inventory?.trackInventory !== false,
          lowStockThreshold: product.inventory?.lowStockThreshold?.toString() || '10'
        },
        status: product.status || 'active',
        featured: product.featured || false,
        tags: product.tags || [],
        specifications: {
          weight: product.specifications?.weight || '',
          dimensions: product.specifications?.dimensions || '',
          material: product.specifications?.material || '',
          color: product.specifications?.color || '',
          size: product.specifications?.size || '',
          brand: product.specifications?.brand || '',
          model: product.specifications?.model || '',
          warranty: product.specifications?.warranty || '',
          custom: product.specifications?.custom || []
        },
        variants: product.variants || [],
        availability: {
          inStore: product.availability?.inStore !== false,
          online: product.availability?.online !== false,
          delivery: product.availability?.delivery || false,
          pickup: product.availability?.pickup !== false
        }
      });
    }
  }, [product, isEditing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInventoryChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [field]: value
      }
    }));
  };

  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleAvailabilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageAdd = () => {
    if (newImageUrl.trim()) {
      const newImage = {
        url: newImageUrl.trim(),
        alt: formData.name || 'Product image',
        primary: formData.images.length === 0
      };
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImageUrl('');
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // If we removed the primary image, make the first remaining image primary
      if (newImages.length > 0 && !newImages.some(img => img.primary)) {
        newImages[0].primary = true;
      }
      return {
        ...prev,
        images: newImages
      };
    });
  };

  const handleImageSetPrimary = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        primary: i === index
      }))
    }));
  };

  const handleCustomSpecAdd = () => {
    if (newCustomSpec.name.trim() && newCustomSpec.value.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          custom: [...prev.specifications.custom, { ...newCustomSpec }]
        }
      }));
      setNewCustomSpec({ name: '', value: '' });
    }
  };

  const handleCustomSpecRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        custom: prev.specifications.custom.filter((_, i) => i !== index)
      }
    }));
  };

  const handleVariantAdd = () => {
    if (newVariant.name.trim() && newVariant.options.some(opt => opt.trim())) {
      const cleanedOptions = newVariant.options.filter(opt => opt.trim());
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { name: newVariant.name.trim(), options: cleanedOptions }]
      }));
      setNewVariant({ name: '', options: [''] });
    }
  };

  const handleVariantRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantOptionChange = (index, value) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleVariantOptionAdd = () => {
    setNewVariant(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleVariantOptionRemove = (index) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.price || !formData.category) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
      inventory: {
        ...formData.inventory,
        stock: formData.inventory.unlimited ? 0 : parseInt(formData.inventory.stock) || 0,
        lowStockThreshold: parseInt(formData.inventory.lowStockThreshold) || 10
      }
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Essential product details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Subcategory
            </label>
            <Input
              value={formData.subcategory}
              onChange={(e) => handleInputChange('subcategory', e.target.value)}
              placeholder="Enter subcategory (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your product..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Compare at Price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.compareAtPrice}
                  onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Original price for discount display</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Featured Product</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" />
            Product Images
          </CardTitle>
          <CardDescription>
            Add images to showcase your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {image.primary && (
                  <Badge className="absolute top-2 left-2 text-xs">Primary</Badge>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => handleImageRemove(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                {!image.primary && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleImageSetPrimary(index)}
                  >
                    Set Primary
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter image URL..."
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={handleImageAdd}
              disabled={!newImageUrl.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            The first image will be set as primary. You can change this by clicking "Set Primary" on any image.
          </p>
        </CardContent>
      </Card>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Manage stock levels and availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.inventory.unlimited}
                onChange={(e) => handleInventoryChange('unlimited', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Unlimited stock</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.inventory.trackInventory}
                onChange={(e) => handleInventoryChange('trackInventory', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Track inventory</span>
            </label>
          </div>

          {!formData.inventory.unlimited && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Quantity
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.inventory.stock}
                  onChange={(e) => handleInventoryChange('stock', e.target.value)}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Low Stock Threshold
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.inventory.lowStockThreshold}
                  onChange={(e) => handleInventoryChange('lowStockThreshold', e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Tags
          </CardTitle>
          <CardDescription>
            Add tags to help customers find your product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleTagRemove(tag)}
                />
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleTagAdd();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleTagAdd}
              disabled={!newTag.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Product Specifications</CardTitle>
          <CardDescription>
            Add detailed product specifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <Input
                value={formData.specifications.weight}
                onChange={(e) => handleSpecificationChange('weight', e.target.value)}
                placeholder="e.g., 1.5 lbs"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dimensions</label>
              <Input
                value={formData.specifications.dimensions}
                onChange={(e) => handleSpecificationChange('dimensions', e.target.value)}
                placeholder="e.g., 10 x 5 x 3 inches"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Material</label>
              <Input
                value={formData.specifications.material}
                onChange={(e) => handleSpecificationChange('material', e.target.value)}
                placeholder="e.g., Cotton, Plastic"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <Input
                value={formData.specifications.color}
                onChange={(e) => handleSpecificationChange('color', e.target.value)}
                placeholder="e.g., Red, Blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <Input
                value={formData.specifications.size}
                onChange={(e) => handleSpecificationChange('size', e.target.value)}
                placeholder="e.g., Large, XL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <Input
                value={formData.specifications.brand}
                onChange={(e) => handleSpecificationChange('brand', e.target.value)}
                placeholder="Brand name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <Input
                value={formData.specifications.model}
                onChange={(e) => handleSpecificationChange('model', e.target.value)}
                placeholder="Model number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Warranty</label>
              <Input
                value={formData.specifications.warranty}
                onChange={(e) => handleSpecificationChange('warranty', e.target.value)}
                placeholder="e.g., 1 year"
              />
            </div>
          </div>

          {/* Custom Specifications */}
          <div>
            <label className="block text-sm font-medium mb-2">Custom Specifications</label>
            <div className="space-y-2">
              {formData.specifications.custom.map((spec, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <span className="font-medium">{spec.name}:</span>
                  <span>{spec.value}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCustomSpecRemove(index)}
                    className="ml-auto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-2">
              <Input
                value={newCustomSpec.name}
                onChange={(e) => setNewCustomSpec(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Specification name"
                className="flex-1"
              />
              <Input
                value={newCustomSpec.value}
                onChange={(e) => setNewCustomSpec(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Value"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleCustomSpecAdd}
                disabled={!newCustomSpec.name.trim() || !newCustomSpec.value.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Availability Options</CardTitle>
          <CardDescription>
            Configure how customers can get this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Available in Store</label>
                  <p className="text-xs text-gray-500">Customers can buy in your physical store</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.availability.inStore}
                  onChange={(e) => handleAvailabilityChange('inStore', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Available Online</label>
                  <p className="text-xs text-gray-500">Show on your online store</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.availability.online}
                  onChange={(e) => handleAvailabilityChange('online', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Delivery Available</label>
                  <p className="text-xs text-gray-500">Offer delivery for this product</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.availability.delivery}
                  onChange={(e) => handleAvailabilityChange('delivery', e.target.checked)}
                  className="rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Pickup Available</label>
                  <p className="text-xs text-gray-500">Allow customer pickup</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.availability.pickup}
                  onChange={(e) => handleAvailabilityChange('pickup', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-3 pt-6">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={submitting || !formData.name.trim() || !formData.price || !formData.category}
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}