"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export default function PostVolunteerOfferPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
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
    { value: "cleaning", label: "Cleaning & Maintenance" },
    { value: "education", label: "Education Programs" },
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
    "Photography", "Video Editing", "Graphic Design", "Writing", "Counseling"
  ];

  const languages = [
    "Arabic", "Urdu", "Turkish", "Farsi", "Bengali", "Malay", "French",
    "Spanish", "German", "Russian", "Chinese", "Hindi", "English"
  ];

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
    if (!session) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/volunteers/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          contactInfo: {
            email: formData.contactEmail,
            phone: formData.contactPhone,
          },
        }),
      });

      if (response.ok) {
        router.push('/volunteers?posted=offer');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to post volunteer offer');
      }
    } catch (error) {
      console.error('Error posting volunteer offer:', error);
      alert('Failed to post volunteer offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="container py-10 text-center">Loading...</div>;
  }

  if (status !== "authenticated" || session?.user?.role !== "user") {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Only community members can post volunteer offers. Please <Link href="/login" className="text-blue-600 hover:underline">login</Link> with a community member account.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Post Volunteer Offer</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Offer Your Skills</CardTitle>
            <CardDescription>Let mosques know how you can help your community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Experienced Teacher Available for Weekend Classes"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you can offer and your background"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill}
                        checked={formData.skillsOffered.includes(skill)}
                        onCheckedChange={() => handleSkillToggle(skill)}
                      />
                      <Label htmlFor={skill} className="text-sm">{skill}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, Weekday evenings, Flexible"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="timeCommitment">Time Commitment</Label>
                <Input
                  id="timeCommitment"
                  placeholder="e.g., 2-3 hours per week, One-time events, Ongoing"
                  value={formData.timeCommitment}
                  onChange={(e) => setFormData({...formData, timeCommitment: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="experience">Experience & Background</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your relevant experience, qualifications, or background"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>

              <div>
                <Label>Languages You Speak</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {languages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={formData.languages.includes(language)}
                        onCheckedChange={() => handleLanguageToggle(language)}
                      />
                      <Label htmlFor={language} className="text-sm">{language}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
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
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Volunteer Offer"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/volunteers">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}