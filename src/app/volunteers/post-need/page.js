'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import {
  Users,
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle
} from 'lucide-react';

export default function PostVolunteerNeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [mosques, setMosques] = useState([]);
  const [need, setNeed] = useState({
    mosqueId: '',
    title: '',
    description: '',
    category: '',
    skills: [],
    location: '',
    timeCommitment: '',
    volunteersNeeded: 1,
    urgent: false,
    startDate: '',
    endDate: '',
    contactInfo: ''
  });

  const volunteerCategories = [
    'Teaching', 'Event Organization', 'Maintenance', 'IT/Technology',
    'Translation', 'Youth Programs', 'Administrative', 'Cleaning', 'Security', 'Other'
  ];

  const skillOptions = [
    'Teaching Quran', 'Arabic Language', 'Islamic Studies', 'Public Speaking',
    'Event Planning', 'Social Media', 'Photography', 'Videography',
    'Graphic Design', 'Web Development', 'Computer Repair', 'Translation',
    'Childcare', 'First Aid', 'Cooking', 'Cleaning', 'Maintenance', 'Security',
    'Accounting', 'Legal Advice', 'Medical Care', 'Counseling'
  ];

  const timeCommitmentOptions = [
    '1-2 hours per week', '3-5 hours per week', '6-10 hours per week',
    'Few hours per month', 'One-time event', 'Flexible schedule',
    'Daily commitment', 'Weekend only', 'Evenings only'
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/volunteers/post-need');
      return;
    }

    if (status === 'authenticated' && !['imam', 'admin'].includes(session?.user?.role)) {
      router.push('/unauthorized');
      return;
    }

    if (status === 'authenticated') {
      fetchUserMosques();
    }
  }, [status, session, router]);

  const fetchUserMosques = async () => {
    try {
      const response = await axios.get('/api/imam/mosques');
      setMosques(response.data);
      
      // Auto-select mosque if imam has only one
      if (response.data.length === 1) {
        setNeed(prev => ({
          ...prev,
          mosqueId: response.data[0]._id,
          location: `${response.data[0].address?.city}, ${response.data[0].address?.state}`
        }));
      }
    } catch (error) {
      console.error('Error fetching mosques:', error);
    }
  };

  const handleSkillToggle = (skill) => {
    setNeed(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleMosqueChange = (mosqueId) => {
    const selectedMosque = mosques.find(m => m._id === mosqueId);
    setNeed(prev => ({
      ...prev,
      mosqueId,
      location: selectedMosque ? `${selectedMosque.address?.city}, ${selectedMosque.address?.state}` : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post volunteer needs.",
        variant: "destructive"
      });
      return;
    }

    if (!need.mosqueId) {
      toast({
        title: "Mosque Required",
        description: "Please select a mosque for this volunteer opportunity.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      await axios.post('/api/volunteers/needs', {
        ...need,
        imamId: session.user.id,
        imamEmail: session.user.email,
        imamName: session.user.name
      });

      toast({
        title: "Volunteer Need Posted!",
        description: "Your volunteer opportunity has been posted successfully. Volunteers can now apply."
      });

      router.push('/volunteers');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post volunteer need. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Volunteers
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Post Volunteer Opportunity</CardTitle>
          <CardDescription>
            Find volunteers for your mosque by posting volunteer opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mosque Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mosque Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Mosque *
                </label>
                <select
                  value={need.mosqueId}
                  onChange={(e) => handleMosqueChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a mosque</option>
                  {mosques.map((mosque) => (
                    <option key={mosque._id} value={mosque._id}>
                      {mosque.name} - {mosque.address?.city}
                    </option>
                  ))}
                </select>
              </div>

              {need.location && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{need.location}</span>
                </div>
              )}
            </div>

            {/* Opportunity Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Volunteer Opportunity Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opportunity Title *
                </label>
                <Input
                  value={need.title}
                  onChange={(e) => setNeed({...need, title: e.target.value})}
                  placeholder="e.g., Weekend Quran Teacher, Event Setup Helper, IT Support"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={need.category}
                    onChange={(e) => setNeed({...need, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {volunteerCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Volunteers Needed *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={need.volunteersNeeded}
                    onChange={(e) => setNeed({...need, volunteersNeeded: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={need.description}
                  onChange={(e) => setNeed({...need, description: e.target.value})}
                  placeholder="Describe the volunteer opportunity, responsibilities, and what volunteers will be doing..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Skills Required */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Required Skills (Optional)</h3>
              <p className="text-sm text-gray-600">Select any specific skills needed for this opportunity:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {skillOptions.map((skill) => (
                  <Button
                    key={skill}
                    type="button"
                    variant={need.skills.includes(skill) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSkillToggle(skill)}
                    className="justify-start"
                  >
                    {skill}
                  </Button>
                ))}
              </div>
            </div>

            {/* Schedule & Commitment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Schedule & Time Commitment</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Commitment *
                </label>
                <select
                  value={need.timeCommitment}
                  onChange={(e) => setNeed({...need, timeCommitment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select time commitment</option>
                  {timeCommitmentOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={need.startDate}
                    onChange={(e) => setNeed({...need, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={need.endDate}
                    onChange={(e) => setNeed({...need, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Information (Optional)
                </label>
                <textarea
                  value={need.contactInfo}
                  onChange={(e) => setNeed({...need, contactInfo: e.target.value})}
                  placeholder="Additional contact details or instructions for volunteers..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={need.urgent}
                  onChange={(e) => setNeed({...need, urgent: e.target.checked})}
                  className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                />
                <label htmlFor="urgent" className="flex items-center text-sm font-medium text-gray-700">
                  <AlertTriangle className="h-4 w-4 mr-1 text-red-500" />
                  This is an urgent request
                </label>
              </div>
            </div>

            {/* Preview & Submit */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Title:</strong> {need.title || 'Not specified'}</p>
                  <p><strong>Category:</strong> {need.category || 'Not specified'}</p>
                  <p><strong>Volunteers Needed:</strong> {need.volunteersNeeded}</p>
                  <p><strong>Time Commitment:</strong> {need.timeCommitment || 'Not specified'}</p>
                  {need.urgent && (
                    <Badge variant="destructive" className="mt-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Urgent Request
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Volunteer Opportunity'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}