"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  BuildingIcon,
  UserIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon
} from "lucide-react";

export default function RegisterForMosquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const mosqueId = searchParams.get('mosque');
  const mosqueName = searchParams.get('name');
  
  const [submitting, setSubmitting] = useState(false);
  const [mosque, setMosque] = useState(null);
  const [formData, setFormData] = useState({
    title: `Volunteer Application for ${mosqueName || 'Mosque'}`,
    description: "",
    motivationMessage: "",
    category: "",
    skillsOffered: [],
    availability: "",
    timeCommitment: "",
    experience: "",
    languages: [],
    contactEmail: session?.user?.email || "",
    contactPhone: "",
  });

  const categories = [
    { value: "education", label: "Education & Teaching" },
    { value: "cleaning", label: "Cleaning & Maintenance" },
    { value: "events", label: "Event Organization" },
    { value: "technical", label: "Technical Support" },
    { value: "administration", label: "Administration" },
    { value: "outreach", label: "Community Outreach" },
    { value: "other", label: "Other" },
  ];

  const availableSkills = [
    "Teaching", "Childcare", "Event Planning", "IT Support", "Web Development",
    "Social Media", "Accounting", "Administration", "Cleaning", "Gardening",
    "Maintenance", "Cooking", "Translation", "Public Speaking", "Marketing",
    "Photography", "Video Editing", "Graphic Design", "Writing", "Counseling",
    "Quran Recitation", "Arabic Language", "Islamic Studies"
  ];

  const languages = [
    "Arabic", "Urdu", "Turkish", "Farsi", "Bengali", "Malay", "French",
    "Spanish", "German", "Russian", "Chinese", "Hindi", "English"
  ];

  // Fetch mosque details
  useEffect(() => {
    if (mosqueId) {
      fetchMosqueDetails();
    }
  }, [mosqueId]);

  const fetchMosqueDetails = async () => {
    try {
      const response = await fetch(`/api/mosques/${mosqueId}`);
      if (response.ok) {
        const data = await response.json();
        setMosque(data.data);
      }
    } catch (error) {
      console.error('Error fetching mosque details:', error);
    }
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skillsOffered: prev.skillsOffered.includes(skill)
        ? prev.skillsOffered.filter(s => s !== skill)
        : [...prev.skillsOffered, skill]
    }));
  };

  const handleLanguageToggle = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !mosqueId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/volunteers/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          mosqueId: mosqueId,
          contactInfo: {
            email: formData.contactEmail,
            phone: formData.contactPhone,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "Application Submitted!",
          description: "Your volunteer application has been sent to the mosque. They will contact you soon.",
        });
        router.push(`/mosques/${mosqueId}?volunteered=true`);
      } else {
        const error = await response.json();
        toast({
          title: "Submission Failed",
          description: error.message || 'Failed to submit volunteer application',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      toast({
        title: "Submission Failed",
        description: 'Failed to submit volunteer application',
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container py-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Please <Link href={`/login?callbackUrl=/volunteers/register-for-mosque?mosque=${mosqueId}&name=${encodeURIComponent(mosqueName || '')}`} className="text-blue-600 hover:underline">login</Link> to volunteer at this mosque.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (session.user.role !== 'user') {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Only community members can apply to volunteer at mosques. Please register with a community member account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!mosqueId || !mosqueName) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Mosque information not found. <Link href="/mosques" className="text-blue-600 hover:underline">Browse mosques</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/mosques/${mosqueId}`}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Mosque
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Apply to Volunteer</h1>
            <p className="text-gray-600">Submit your application to help this mosque</p>
          </div>
        </div>

        {/* Mosque Info Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BuildingIcon className="h-5 w-5 mr-2" />
              {mosqueName}
            </CardTitle>
            {mosque && (
              <CardDescription>
                {mosque.address}, {mosque.city}, {mosque.state}
                {mosque.description && (
                  <span className="block mt-2">{mosque.description}</span>
                )}
              </CardDescription>
            )}
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Your Volunteer Application
            </CardTitle>
            <CardDescription>
              Tell the mosque about yourself and how you'd like to help their community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Application Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Experienced Teacher Available for Weekend Classes"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="motivationMessage">Why do you want to volunteer at this mosque? *</Label>
                <Textarea
                  id="motivationMessage"
                  placeholder="Share your motivation and what draws you to volunteer here..."
                  value={formData.motivationMessage}
                  onChange={(e) => setFormData({...formData, motivationMessage: e.target.value})}
                  required
                  rows={4}
                />
                <p className="text-sm text-gray-500 mt-1">This helps the mosque understand your commitment and interests.</p>
              </div>

              <div>
                <Label htmlFor="description">How would you like to help?</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you can offer and how you'd like to contribute..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Primary Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the main area you'd like to help with" />
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

              <div>
                <Label>Skills You Can Offer</Label>
                <p className="text-sm text-gray-500 mb-3">Select all skills that apply to you</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {availableSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.skillsOffered.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label htmlFor={skill} className="text-sm cursor-pointer">{skill}</Label>
                    </div>
                  ))}
                </div>
                {formData.skillsOffered.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Selected skills:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.skillsOffered.map(skill => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="availability">Your Availability *</Label>
                  <Input
                    id="availability"
                    placeholder="e.g., Weekends, Weekday evenings, Flexible"
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="timeCommitment">Time Commitment You Can Offer *</Label>
                  <Input
                    id="timeCommitment"
                    placeholder="e.g., 2-3 hours per week, One-time events"
                    value={formData.timeCommitment}
                    onChange={(e) => setFormData({...formData, timeCommitment: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experience">Relevant Experience & Background</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe any relevant experience, qualifications, or background that would help in your volunteer role..."
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <Label>Languages You Speak</Label>
                <p className="text-sm text-gray-500 mb-3">This helps the mosque match you with appropriate volunteer opportunities</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {languages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={() => handleLanguageToggle(language)}
                      />
                      <Label htmlFor={language} className="text-sm cursor-pointer">{language}</Label>
                    </div>
                  ))}
                </div>
                {formData.languages.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {formData.languages.map(language => (
                        <Badge key={language} variant="outline" className="text-xs">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="e.g., 07123456789"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <StarIcon className="h-4 w-4 mr-2" />
                      Submit Volunteer Application
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/mosques/${mosqueId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" />
              What happens next?
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Your application will be sent directly to the mosque administration</li>
              <li>• The mosque will review your application and may contact you for more information</li>
              <li>• If accepted, they will coordinate with you on volunteer schedules and activities</li>
              <li>• You can check your application status in your profile</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}