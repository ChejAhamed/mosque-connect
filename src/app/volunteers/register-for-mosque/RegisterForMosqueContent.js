'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

export default function RegisterForMosqueContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    imam: {
      name: '',
      email: '',
      phone: ''
    },
    services: [],
    description: '',
    capacity: '',
    establishedYear: '',
    denomination: 'Sunni'
  });

  const [newService, setNewService] = useState('');

  // Common mosque services
  const commonServices = [
    'Daily Prayers (Salah)',
    'Friday Prayers (Jummah)',
    'Tarawih Prayers',
    'Islamic Education',
    'Quran Classes',
    'Arabic Classes',
    'Youth Programs',
    'Community Events',
    'Marriage Services',
    'Funeral Services',
    'Islamic Library',
    'Food Bank',
    'Counseling Services',
    'Interfaith Dialogue'
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/volunteers/register-for-mosque");
      return;
    }

    if (status === "authenticated") {
      // Pre-fill imam information from user session if available
      if (session?.user) {
        setFormData(prev => ({
          ...prev,
          imam: {
            name: session.user.name || '',
            email: session.user.email || '',
            phone: prev.imam.phone
          }
        }));
      }
    }
  }, [status, session, router]);

  const handleServiceAdd = (service) => {
    if (service && !formData.services.includes(service)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
      setNewService('');
    }
  };

  const handleServiceRemove = (serviceToRemove) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(service => service !== serviceToRemove)
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
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

  const handleImamChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      imam: {
        ...prev.imam,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.address.street || !formData.address.city || 
        !formData.address.state || !formData.imam.name || !formData.imam.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.post('/api/mosques', formData);

      toast({
        title: "Success",
        description: "Mosque registration submitted successfully. It will be reviewed by administrators."
      });

      router.push("/dashboard/imam");
    } catch (error) {
      console.error('Error submitting mosque registration:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit mosque registration",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Mosque</h1>
          <p className="text-gray-600">Join our community platform and connect with volunteers</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Mosque Registration Form
          </CardTitle>
          <CardDescription>
            Please provide detailed information about your mosque. All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mosque Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter mosque name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Denomination
                  </label>
                  <Select 
                    value={formData.denomination} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, denomination: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunni">Sunni</SelectItem>
                      <SelectItem value="Shia">Shia</SelectItem>
                      <SelectItem value="Non-denominational">Non-denominational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Capacity (approximate)
                  </label>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="e.g. 300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Established Year
                  </label>
                  <Input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.establishedYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: e.target.value }))}
                    placeholder="e.g. 1995"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your mosque, its mission, and community..."
                  rows={3}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.address.street}
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
                    value={formData.address.city}
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
                    value={formData.address.state} 
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
                  <label className="block text-sm font-medium mb-2">
                    ZIP Code
                  </label>
                  <Input
                    value={formData.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    placeholder="mosque@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Website (optional)
                </label>
                <Input
                  type="url"
                  value={formData.contact.website}
                  onChange={(e) => handleContactChange('website', e.target.value)}
                  placeholder="https://www.mosquename.org"
                />
              </div>
            </div>

            {/* Imam Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Imam Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Imam Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.imam.name}
                    onChange={(e) => handleImamChange('name', e.target.value)}
                    placeholder="Enter imam's name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Imam Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.imam.email}
                    onChange={(e) => handleImamChange('email', e.target.value)}
                    placeholder="imam@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Imam Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.imam.phone}
                  onChange={(e) => handleImamChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Services & Programs</h3>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {service}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleServiceRemove(service)}
                      />
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Select onValueChange={handleServiceAdd}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add a service..." />
                    </SelectTrigger>
                    <SelectContent>
                      {commonServices
                        .filter(service => !formData.services.includes(service))
                        .map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Add custom service..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleServiceAdd(newService);
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleServiceAdd(newService)}
                    disabled={!newService.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Registration
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}