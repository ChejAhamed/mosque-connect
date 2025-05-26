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
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';

export default function VolunteersApplyContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mosque, setMosque] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    message: '',
    skills: [],
    availability: {
      days: [],
      timeSlots: [],
      hoursPerWeek: ''
    }
  });

  const mosqueId = searchParams.get('mosqueId');
  const category = searchParams.get('category');

  // Skills options
  const skillOptions = [
    'Teaching', 'Event Organization', 'Public Speaking', 'Administration',
    'Fundraising', 'Social Media', 'Graphic Design', 'Photography',
    'Translation', 'Counseling', 'Youth Mentoring', 'Community Outreach',
    'IT Support', 'Maintenance', 'Cooking', 'Cleaning', 'Security',
    'Medical/Healthcare', 'Legal Advice', 'Accounting', 'Construction'
  ];

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlotOptions = ['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-10PM)', 'Night (10PM-6AM)'];

  const categories = [
    { value: 'education', label: 'Education & Teaching' },
    { value: 'events', label: 'Events & Programs' },
    { value: 'maintenance', label: 'Maintenance & Facilities' },
    { value: 'administration', label: 'Administration & Office' },
    { value: 'youth', label: 'Youth Programs' },
    { value: 'community', label: 'Community Outreach' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'general', label: 'General Volunteer' }
  ];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/volunteers/apply");
      return;
    }

    if (status === "authenticated") {
      if (!mosqueId) {
        router.push("/volunteers");
        return;
      }
      
      fetchMosqueData();
      
      // Set category from URL if provided
      if (category) {
        setFormData(prev => ({ ...prev, category }));
      }
    }
  }, [status, mosqueId, category, router]);

  const fetchMosqueData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/mosques/${mosqueId}`);
      setMosque(response.data.mosque);
    } catch (error) {
      console.error('Error fetching mosque:', error);
      toast({
        title: "Error",
        description: "Failed to load mosque information",
        variant: "destructive"
      });
      router.push("/volunteers");
    } finally {
      setLoading(false);
    }
  };

  const handleSkillAdd = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleDayToggle = (day) => {
    const newDays = formData.availability.days.includes(day)
      ? formData.availability.days.filter(d => d !== day)
      : [...formData.availability.days, day];
    
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: newDays
      }
    }));
  };

  const handleTimeSlotToggle = (timeSlot) => {
    const newTimeSlots = formData.availability.timeSlots.includes(timeSlot)
      ? formData.availability.timeSlots.filter(ts => ts !== timeSlot)
      : [...formData.availability.timeSlots, timeSlot];
    
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: newTimeSlots
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast({
        title: "Error",
        description: "Please select a volunteer category",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      await axios.post('/api/user/volunteer/applications', {
        mosqueId,
        ...formData
      });

      toast({
        title: "Success",
        description: "Volunteer application submitted successfully"
      });

      router.push("/dashboard/volunteer");
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Apply to Volunteer</h1>
          <p className="text-gray-600">Submit your volunteer application</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mosque Information */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Mosque Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{mosque?.name}</h3>
                <p className="text-gray-600">{mosque?.address?.street}</p>
                <p className="text-gray-600">
                  {mosque?.address?.city}, {mosque?.address?.state} {mosque?.address?.zipCode}
                </p>
              </div>
              
              {mosque?.services && mosque.services.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Services</h4>
                  <div className="flex flex-wrap gap-1">
                    {mosque.services.slice(0, 3).map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                    {mosque.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mosque.services.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                <p>Your application will be reviewed by the mosque administration.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Application Form</CardTitle>
              <CardDescription>
                Please fill out the information below to apply as a volunteer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Volunteer Category <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select volunteer category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message to Mosque (Optional)
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Tell the mosque why you want to volunteer and what you hope to contribute..."
                    rows={4}
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium mb-2">Your Skills</label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleSkillRemove(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={handleSkillAdd}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add a skill..." />
                      </SelectTrigger>
                      <SelectContent>
                        {skillOptions
                          .filter(skill => !formData.skills.includes(skill))
                          .map((skill) => (
                            <SelectItem key={skill} value={skill}>
                              {skill}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium mb-2">Availability</label>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Available Days</p>
                      <div className="flex flex-wrap gap-2">
                        {dayOptions.map(day => (
                          <Button
                            key={day}
                            type="button"
                            variant={formData.availability.days.includes(day) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleDayToggle(day)}
                          >
                            {day.substring(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Preferred Time Slots</p>
                      <div className="space-y-2">
                        {timeSlotOptions.map(timeSlot => (
                          <label key={timeSlot} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.availability.timeSlots.includes(timeSlot)}
                              onChange={() => handleTimeSlotToggle(timeSlot)}
                              className="rounded"
                            />
                            <span className="text-sm">{timeSlot}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Hours per week (optional)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="40"
                        value={formData.availability.hoursPerWeek}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            hoursPerWeek: e.target.value
                          }
                        }))}
                        placeholder="e.g. 5"
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || !formData.category}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}