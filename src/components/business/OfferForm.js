'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
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
  Tags,
  Percent,
  DollarSign,
  Calendar,
  Target,
  Save,
  Plus,
  X
} from 'lucide-react';

export function OfferForm({ 
  offer = null, 
  onSubmit, 
  onCancel, 
  submitting = false, 
  isEditing = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    applicableProducts: [],
    applicableCategories: [],
    minimumPurchase: '',
    validFrom: '',
    validTo: '',
    status: 'draft',
    featured: false,
    termsAndConditions: '',
    usageLimit: '',
    customerLimit: '',
    code: '',
    autoApply: false,
    priority: '0',
    image: ''
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Load offer data if editing
  useEffect(() => {
    if (offer && isEditing) {
      const validFrom = new Date(offer.validFrom).toISOString().slice(0, 16);
      const validTo = new Date(offer.validTo).toISOString().slice(0, 16);
      
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        discountType: offer.discountType || 'percentage',
        discountValue: offer.discountValue?.toString() || '',
        applicableProducts: offer.applicableProducts || [],
        applicableCategories: offer.applicableCategories || [],
        minimumPurchase: offer.minimumPurchase?.toString() || '',
        validFrom,
        validTo,
        status: offer.status || 'draft',
        featured: offer.featured || false,
        termsAndConditions: offer.termsAndConditions || '',
        usageLimit: offer.usageLimit?.toString() || '',
        customerLimit: offer.customerLimit?.toString() || '',
        code: offer.code || '',
        autoApply: offer.autoApply || false,
        priority: offer.priority?.toString() || '0',
        image: offer.image || ''
      });
      
      setSelectedProducts(offer.applicableProducts || []);
      setSelectedCategories(offer.applicableCategories || []);
    }
  }, [offer, isEditing]);

  // Fetch products and categories
  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const fetchProductsAndCategories = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/business/products?limit=100'),
        axios.get('/api/business/products/categories')
      ]);
      
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching products and categories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductToggle = (productId) => {
    const newSelectedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    
    setSelectedProducts(newSelectedProducts);
    setFormData(prev => ({
      ...prev,
      applicableProducts: newSelectedProducts
    }));
  };

  const handleCategoryToggle = (category) => {
    const newSelectedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(cat => cat !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newSelectedCategories);
    setFormData(prev => ({
      ...prev,
      applicableCategories: newSelectedCategories
    }));
  };

  const generateOfferCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prev => ({ ...prev, code: result }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.discountValue || !formData.validFrom || !formData.validTo) {
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      discountValue: parseFloat(formData.discountValue),
      minimumPurchase: formData.minimumPurchase ? parseFloat(formData.minimumPurchase) : 0,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      customerLimit: formData.customerLimit ? parseInt(formData.customerLimit) : undefined,
      priority: parseInt(formData.priority) || 0,
      validFrom: new Date(formData.validFrom),
      validTo: new Date(formData.validTo)
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tags className="h-5 w-5 mr-2" />
            Offer Details
          </CardTitle>
          <CardDescription>
            Basic information about your promotional offer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Offer Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Summer Sale 20% Off"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Offer Code
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="SUMMER20"
                />
                <Button type="button" onClick={generateOfferCode} variant="outline">
                  Generate
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for automatic application or generate a custom code
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your offer to customers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <Select 
                value={formData.discountType} 
                onValueChange={(value) => handleInputChange('discountType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                  <SelectItem value="free_shipping">Free Shipping</SelectItem>
                  <SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {formData.discountType === 'percentage' ? (
                  <Percent className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                ) : (
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                )}
                <Input
                  type="number"
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  value={formData.discountValue}
                  onChange={(e) => handleInputChange('discountValue', e.target.value)}
                  placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Purchase
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minimumPurchase}
                  onChange={(e) => handleInputChange('minimumPurchase', e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Optional minimum purchase amount</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <Input
                type="number"
                min="0"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Higher numbers = higher priority</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Featured Offer</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.autoApply}
                onChange={(e) => handleInputChange('autoApply', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto Apply (no code needed)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Validity Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Validity Period
          </CardTitle>
          <CardDescription>
            Set when this offer is active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Valid From <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Valid Until <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.validTo}
                onChange={(e) => handleInputChange('validTo', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Usage Limit
              </label>
              <Input
                type="number"
                min="1"
                value={formData.usageLimit}
                onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                placeholder="Unlimited"
              />
              <p className="text-xs text-gray-500 mt-1">Total number of times this offer can be used</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Per Customer Limit
              </label>
              <Input
                type="number"
                min="1"
                value={formData.customerLimit}
                onChange={(e) => handleInputChange('customerLimit', e.target.value)}
                placeholder="Unlimited"
              />
              <p className="text-xs text-gray-500 mt-1">How many times one customer can use this offer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicable Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Applicable Products
          </CardTitle>
          <CardDescription>
            Select which products this offer applies to (leave empty for all products)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-2">Product Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Specific Products */}
          <div>
            <label className="block text-sm font-medium mb-2">Specific Products</label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
              {products.length > 0 ? (
                products.map((product) => (
                  <label key={product._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleProductToggle(product._id)}
                      className="rounded"
                    />
                    <div className="flex items-center space-x-2">
                      {product.primaryImage && (
                        <img 
                          src={product.primaryImage.url} 
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      )}
                      <div>
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500 ml-2">${product.price}</span>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No products available</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
          <CardDescription>
            Additional terms for this offer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Terms and Conditions
            </label>
            <Textarea
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              placeholder="Enter any terms and conditions for this offer..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Offer Image URL
            </label>
            <Input
              type="url"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/offer-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Optional image to display with the offer</p>
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
          disabled={submitting || !formData.title.trim() || !formData.discountValue || !formData.validFrom || !formData.validTo}
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Offer' : 'Create Offer'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}