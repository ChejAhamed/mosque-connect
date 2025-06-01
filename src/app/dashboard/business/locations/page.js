'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
  Phone,
  Globe,
  Navigation,
  Building,
  Users,
  Star
} from 'lucide-react';
import axios from 'axios';

export default function BusinessLocationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    phone: '',
    email: '',
    description: '',
    isPrimary: false,
    isActive: true,
    operatingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '12:00', close: '16:00', closed: true }
    },
    amenities: [],
    coordinates: { lat: null, lng: null }
  });

  const amenitiesList = [
    'Parking Available',
    'Wheelchair Accessible',
    'Prayer Room',
    'Halal Certified',
    'Family Friendly',
    'Delivery Available',
    'Takeout Available',
    'Dine-in Available',
    'WiFi Available',
    'Air Conditioning'
  ];

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || session.user.role !== 'business') {
      router.push('/dashboard');
      return;
    }

    fetchLocations();
  }, [session, status, router]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      // For now, we'll use simulated data
      // const response = await axios.get('/api/business/locations');
      // setLocations(response.data.locations || []);
      
      // Simulated data
      setLocations([
        {
          _id: '1',
          name: 'Main Store',
          address: {
            street: '123 Main St',
            city: 'Minneapolis',
            state: 'MN',
            zipCode: '55401',
            country: 'USA'
          },
          phone: '+1 (555) 123-4567',
          email: 'main@business.com',
          description: 'Our main store location',
          isPrimary: true,
          isActive: true,
          operatingHours: {
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: '12:00', close: '16:00', closed: true }
          },
          amenities: ['Parking Available', 'Wheelchair Accessible', 'Halal Certified'],
          stats: { visits: 234, rating: 4.5, reviews: 23 }
        }
      ]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      // const response = await axios.post('/api/business/locations', formData);
      // setLocations(prev => [...prev, response.data.location]);
      
      // Simulated creation
      const newLocation = {
        ...formData,
        _id: Date.now().toString(),
        stats: { visits: 0, rating: 0, reviews: 0 }
      };
      setLocations(prev => [...prev, newLocation]);
      
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('Location created successfully');
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error('Failed to create location');
    }
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    try {
      // const response = await axios.put(`/api/business/locations/${editingLocation._id}`, formData);
      // setLocations(prev => prev.map(loc => loc._id === editingLocation._id ? response.data.location : loc));
      
      // Simulated update
      setLocations(prev => prev.map(loc => 
        loc._id === editingLocation._id ? { ...loc, ...formData } : loc
      ));
      
      setEditingLocation(null);
      resetForm();
      toast.success('Location updated successfully');
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error('Failed to update location');
    }
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      // await axios.delete(`/api/business/locations/${locationId}`);
      setLocations(prev => prev.filter(loc => loc._id !== locationId));
      toast.success('Location deleted successfully');
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      phone: '',
      email: '',
      description: '',
      isPrimary: false,
      isActive: true,
      operatingHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '12:00', close: '16:00', closed: true }
      },
      amenities: [],
      coordinates: { lat: null, lng: null }
    });
  };

  const openEditDialog = (location) => {
    setEditingLocation(location);
    setFormData(location);
  };

  const formatOperatingHours = (hours) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const dayHours = hours[day];
      if (dayHours.closed) return `${day.charAt(0).toUpperCase() + day.slice(1)}: Closed`;
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${dayHours.open} - ${dayHours.close}`;
    }).join('\n');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading locations...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Locations</h1>
          <p className="text-gray-600">Manage your business locations and store information</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>
                Add a new business location with complete details
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateLocation} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Main Store, Branch Office, etc."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Input
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="Street Address"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="City"
                    required
                  />
                  <Input
                    value={formData.address.state}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="State"
                    required
                  />
                  <Input
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="ZIP Code"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this location"
                  rows={3}
                />
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {amenitiesList.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              amenities: [...prev.amenities, amenity]
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              amenities: prev.amenities.filter(a => a !== amenity)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrimary: checked }))}
                  />
                  <Label htmlFor="isPrimary">Primary Location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Location</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Locations List */}
      <div className="space-y-6">
        {locations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No locations yet</h3>
              <p className="text-gray-600 mb-4">Add your first business location to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </CardContent>
          </Card>
        ) : (
          locations.map((location) => (
            <Card key={location._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{location.name}</CardTitle>
                      {location.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                      {!location.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {location.address.street}, {location.address.city}, {location.address.state}
                      </span>
                      {location.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {location.phone}
                        </span>
                      )}
                      {location.stats && (
                        <>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {location.stats.visits} visits
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            {location.stats.rating}/5 ({location.stats.reviews} reviews)
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(location)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteLocation(location._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-gray-700 text-sm">{location.description || 'No description available'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-1">
                      {location.amenities.map(amenity => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                {location.operatingHours && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Operating Hours</h4>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {formatOperatingHours(location.operatingHours)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}