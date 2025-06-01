'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
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
import { LoadingSpinner } from '@/components/ui/loading-states';
import { BusinessMap } from '@/components/business/BusinessMap';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Camera,
  Save,
  Plus,
  X,
  Facebook,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react';

export default function BusinessProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    contact: {
      phone: '',
      email: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
        coordinates: []
      }
    },
    hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    settings: {
      acceptsOrders: true,
      deliveryAvailable: false,
      pickupAvailable: true,
      onlinePayments: false
    },
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const businessCategories = [
    { value: 'restaurant', label: 'Restaurant & Food' },
    { value: 'grocery', label: 'Grocery & Market' },
    { value: 'clothing', label: 'Clothing & Fashion' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'services', label: 'Services' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'beauty', label: 'Beauty & Wellness' },
    { value: 'home_garden', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Recreation' },
    { value: 'books', label: 'Books & Media' },
    { value: 'jewelry', label: 'Jewelry & Accessories' },
    { value: 'other', label: 'Other' }
  ];

  const states = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/business/profile");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "business") {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchBusinessProfile();
    }
  }, [status, session, router]);

  const fetchBusinessProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/business/profile');
      const businessData = response.data.business;
      
      setBusiness(businessData);
      setFormData({
        name: businessData.name || '',
        description: businessData.description || '',
        category: businessData.category || '',
        contact: {
          phone: businessData.contact?.phone || '',
          email: businessData.contact?.email || '',
          website: businessData.contact?.website || '',
          address: {
            street: businessData.contact?.address?.street || '',
            city: businessData.contact?.address?.city || '',
            state: businessData.contact?.address?.state || '',
            zipCode: businessData.contact?.address?.zipCode || '',
            country: businessData.contact?.address?.country || 'United States',
            coordinates: businessData.contact?.address?.coordinates || []
          }
        },
        hours: businessData.hours || formData.hours,
        socialMedia: businessData.socialMedia || formData.socialMedia,
        settings: businessData.settings || formData.settings,
        tags: businessData.tags || []
      });
    } catch (error) {
      console.error('Error fetching business profile:', error);
      toast({
        title: "Error",
        description: "Failed to load business profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        address: {
          ...prev.contact.address,
          [field]: value
        }
      }
    }));
  };

  const handleContactChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSettingsChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
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

  const handleLocationSelect = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        address: {
          ...prev.contact.address,
          coordinates
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.contact.address.street) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      await axios.put('/api/business/profile', formData);

      toast({
        title: "Success",
        description: "Business profile updated successfully"
      });

      // Refresh data
      fetchBusinessProfile();
    } catch (error) {
      console.error('Error updating business profile:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update business profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
      <div className="container mx-auto p-6 max-w-4xl pt-60">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/business')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600">Manage your business information and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter business name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your business, products, and services..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="space-y-3">
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
                    placeholder="Add tags to help customers find you..."
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  placeholder="business@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input
                type="url"
                value={formData.contact.website}
                onChange={(e) => handleContactChange('website', e.target.value)}
                placeholder="https://www.yourbusiness.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Street Address <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.contact.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="Enter street address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.contact.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={formData.contact.address.state} 
                  onValueChange={(value) => handleAddressChange('state', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code</label>
                <Input
                  value={formData.contact.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            {/* Map Component */}
            <div>
              <label className="block text-sm font-medium mb-2">Location on Map</label>
              <div className="h-64 border rounded-lg overflow-hidden">
                <BusinessMap
                  address={formData.contact.address}
                  coordinates={formData.contact.address.coordinates}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click on the map to set your exact location
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dayNames.map((day) => (
                <div key={day} className="flex items-center space-x-4">
                  <div className="w-24">
                    <label className="text-sm font-medium capitalize">{day}</label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!formData.hours[day]?.closed}
                      onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Open</span>
                  </div>
                  
                  {!formData.hours[day]?.closed && (
                    <>
                      <Input
                        type="time"
                        value={formData.hours[day]?.open || '09:00'}
                        onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-sm">to</span>
                      <Input
                        type="time"
                        value={formData.hours[day]?.close || '17:00'}
                        onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  )}
                  
                  {formData.hours[day]?.closed && (
                    <span className="text-sm text-gray-500">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Connect your social media accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                  Facebook
                </label>
                <Input
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourbusiness"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                  Instagram
                </label>
                <Input
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  placeholder="https://instagram.com/yourbusiness"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter
                </label>
                <Input
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/yourbusiness"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                  LinkedIn
                </label>
                <Input
                  value={formData.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/yourbusiness"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
            <CardDescription>Configure how customers can interact with your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Accept Orders</label>
                    <p className="text-xs text-gray-500">Allow customers to place orders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.acceptsOrders}
                    onChange={(e) => handleSettingsChange('acceptsOrders', e.target.checked)}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Delivery Available</label>
                    <p className="text-xs text-gray-500">Offer delivery services</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.deliveryAvailable}
                    onChange={(e) => handleSettingsChange('deliveryAvailable', e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Pickup Available</label>
                    <p className="text-xs text-gray-500">Allow customer pickup</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.pickupAvailable}
                    onChange={(e) => handleSettingsChange('pickupAvailable', e.target.checked)}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Online Payments</label>
                    <p className="text-xs text-gray-500">Accept online payments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.settings.onlinePayments}
                    onChange={(e) => handleSettingsChange('onlinePayments', e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/dashboard/business')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}