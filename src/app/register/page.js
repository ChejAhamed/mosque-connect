'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  User,
  Store,
  MapPin,
  Phone,
  Mail,
  Building,
  UserPlus,
  Building2,  // Using Building2 instead of Mosque
  Users,
  Heart
} from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    // User data
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    role: 'user',
    
    // Business data (only for business users)
    businessName: '',
    businessDescription: '',
    businessCategory: '',
    businessPhone: '',
    businessWebsite: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },

    // Mosque data (only for imam users)
    mosqueName: '',
    mosqueDescription: '',
    mosquePhone: '',
    mosqueWebsite: '',
    mosqueAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    mosqueCapacity: '',
    mosqueServices: []
  });

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

  const mosqueServices = [
    'Daily Prayers',
    'Friday Prayers',
    'Islamic Education',
    'Quran Classes',
    'Youth Programs',
    'Women Programs',
    'Community Events',
    'Marriage Services',
    'Funeral Services',
    'Counseling',
    'Food Bank',
    'Library'
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

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData(prev => ({
      ...prev,
      role: type
    }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      mosqueServices: prev.mosqueServices.includes(service)
        ? prev.mosqueServices.filter(s => s !== service)
        : [...prev.mosqueServices, service]
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    // Additional validation for business users
    if (userType === 'business') {
      if (!formData.businessName || !formData.businessCategory || !formData.businessAddress.street) {
        toast({
          title: "Error",
          description: "Please fill in all required business information",
          variant: "destructive"
        });
        return false;
      }
    }

    // Additional validation for imam users
    if (userType === 'imam') {
      if (!formData.mosqueName || !formData.mosqueAddress.street) {
        toast({
          title: "Error",
          description: "Please fill in all required mosque information",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare registration data
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
        role: userType,
      };

      // Add business data if user is registering as business
      if (userType === 'business') {
        registrationData.businessData = {
          name: formData.businessName,
          description: formData.businessDescription,
          category: formData.businessCategory,
          contact: {
            phone: formData.businessPhone,
            email: formData.email,
            website: formData.businessWebsite,
            address: {
              street: formData.businessAddress.street,
              city: formData.businessAddress.city,
              state: formData.businessAddress.state,
              zipCode: formData.businessAddress.zipCode,
              country: 'United States'
            }
          }
        };
      }

      // Add mosque data if user is registering as imam
      if (userType === 'imam') {
        registrationData.mosqueData = {
          name: formData.mosqueName,
          description: formData.mosqueDescription,
          contact: {
            phone: formData.mosquePhone,
            email: formData.email,
            website: formData.mosqueWebsite,
            address: {
              street: formData.mosqueAddress.street,
              city: formData.mosqueAddress.city,
              state: formData.mosqueAddress.state,
              zipCode: formData.mosqueAddress.zipCode,
              country: 'United States'
            }
          },
          capacity: formData.mosqueCapacity ? parseInt(formData.mosqueCapacity) : null,
          services: formData.mosqueServices
        };
      }

      await axios.post('/api/user/register', registrationData);

      toast({
        title: "Success",
        description: getSuccessMessage(userType)
      });

      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSuccessMessage = (type) => {
    switch (type) {
      case 'business':
        return "Business account registered successfully! Please log in.";
      case 'imam':
        return "Imam account and mosque registered successfully! Please log in.";
      default:
        return "Account created successfully! Please log in.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Our Community</h1>
          <p className="text-gray-600">Create your account and connect with your community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Registration</CardTitle>
            <CardDescription>Choose your account type and provide your information</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Account Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Account Type</label>
              <Tabs value={userType} onValueChange={handleUserTypeChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="user" className="flex items-center text-xs">
                    <Users className="h-4 w-4 mr-1" />
                    Member
                  </TabsTrigger>
                  <TabsTrigger value="imam" className="flex items-center text-xs">
                    <Building2 className="h-4 w-4 mr-1" />
                    Imam
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center text-xs">
                    <Store className="h-4 w-4 mr-1" />
                    Business
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="mt-6">
                  <TabsContent value="user" className="space-y-4">
                    {/* Community Member Form */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                        <Heart className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Community Member</h3>
                      <p className="text-sm text-gray-600">Join as a community member to connect, volunteer, and participate</p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">City</label>
                          <Input
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="Your city"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Create a password"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="imam" className="space-y-6">
                    {/* Imam Form */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                        <Building2 className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Imam Account</h3>
                      <p className="text-sm text-gray-600">Register your mosque and manage your community</p>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Personal Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <Input
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Your city"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="password"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Create a password"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirm your password"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mosque Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2" />
                        Mosque Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Mosque Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.mosqueName}
                            onChange={(e) => handleInputChange('mosqueName', e.target.value)}
                            placeholder="Enter mosque name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Mosque Description</label>
                          <Textarea
                            value={formData.mosqueDescription}
                            onChange={(e) => handleInputChange('mosqueDescription', e.target.value)}
                            placeholder="Describe your mosque and community..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <Input
                              type="tel"
                              value={formData.mosquePhone}
                              onChange={(e) => handleInputChange('mosquePhone', e.target.value)}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Website</label>
                            <Input
                              type="url"
                              value={formData.mosqueWebsite}
                              onChange={(e) => handleInputChange('mosqueWebsite', e.target.value)}
                              placeholder="https://mosque.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">Capacity</label>
                            <Input
                              type="number"
                              value={formData.mosqueCapacity}
                              onChange={(e) => handleInputChange('mosqueCapacity', e.target.value)}
                              placeholder="100"
                            />
                          </div>
                        </div>

                        {/* Services */}
                        <div>
                          <label className="block text-sm font-medium mb-2">Services Offered</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {mosqueServices.map((service) => (
                              <label key={service} className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={formData.mosqueServices.includes(service)}
                                  onChange={() => handleServiceToggle(service)}
                                  className="rounded"
                                />
                                <span>{service}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mosque Address */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Mosque Address
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.mosqueAddress.street}
                            onChange={(e) => handleInputChange('mosqueAddress.street', e.target.value)}
                            placeholder="Enter mosque address"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <Input
                              value={formData.mosqueAddress.city}
                              onChange={(e) => handleInputChange('mosqueAddress.city', e.target.value)}
                              placeholder="City"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <Select 
                              value={formData.mosqueAddress.state} 
                              onValueChange={(value) => handleInputChange('mosqueAddress.state', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="State" />
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
                              value={formData.mosqueAddress.zipCode}
                              onChange={(e) => handleInputChange('mosqueAddress.zipCode', e.target.value)}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-6">
                    {/* Business Owner Form */}
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
                        <Store className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Business Owner</h3>
                      <p className="text-sm text-gray-600">Register your business and connect with the community</p>
                    </div>
                    
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <UserPlus className="h-5 w-5 mr-2" />
                        Personal Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <Input
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="Your city"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Enter your email"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="password"
                              value={formData.password}
                              onChange={(e) => handleInputChange('password', e.target.value)}
                              placeholder="Create a password"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="password"
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                              placeholder="Confirm your password"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Business Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Business Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.businessName}
                            onChange={(e) => handleInputChange('businessName', e.target.value)}
                            placeholder="Enter your business name"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Business Category <span className="text-red-500">*</span>
                          </label>
                          <Select 
                            value={formData.businessCategory} 
                            onValueChange={(value) => handleInputChange('businessCategory', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your business category" />
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

                        <div>
                          <label className="block text-sm font-medium mb-2">Business Description</label>
                          <Textarea
                            value={formData.businessDescription}
                            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                            placeholder="Describe your business..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Business Phone</label>
                            <Input
                              type="tel"
                              value={formData.businessPhone}
                              onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Business Website</label>
                            <Input
                              type="url"
                              value={formData.businessWebsite}
                              onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                              placeholder="https://www.yourbusiness.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Business Address */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Business Address
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.businessAddress.street}
                            onChange={(e) => handleInputChange('businessAddress.street', e.target.value)}
                            placeholder="Enter your business address"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <Input
                              value={formData.businessAddress.city}
                              onChange={(e) => handleInputChange('businessAddress.city', e.target.value)}
                              placeholder="City"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <Select 
                              value={formData.businessAddress.state} 
                              onValueChange={(value) => handleInputChange('businessAddress.state', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="State" />
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
                              value={formData.businessAddress.zipCode}
                              onChange={(e) => handleInputChange('businessAddress.zipCode', e.target.value)}
                              placeholder="12345"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Submit Button */}
                  <div className="border-t pt-6">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="w-full"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create {userType === 'business' ? 'Business ' : userType === 'imam' ? 'Imam ' : ''}Account
                        </>
                      )}
                    </Button>
                    
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                          Sign in here
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}