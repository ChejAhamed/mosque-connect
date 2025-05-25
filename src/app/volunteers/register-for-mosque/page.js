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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterForMosquePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mosqueId = searchParams.get('mosque');
  const mosqueName = searchParams.get('name');
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: `Volunteer Application for ${mosqueName || 'Mosque'}`,
    description: "",
    category: "other",
    skillsOffered: [],
    availability: "",
    timeCommitment: "",
    experience: "",
    languages: [],
    contactEmail: session?.user?.email || "",
    contactPhone: "",
    motivationMessage: "",
  });

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
    if (!session || !mosqueId) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/volunteers/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetMosqueId: mosqueId,
          isGeneralOffer: false,
          contactInfo: {
            email: formData.contactEmail,
            phone: formData.contactPhone,
          },
        }),
      });

      if (response.ok) {
        router.push(`/mosques/${mosqueId}?volunteered=true`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit volunteer registration');
      }
    } catch (error) {
      console.error('Error submitting volunteer registration:', error);
      alert('Failed to submit volunteer registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="container py-10 text-center">Loading...</div>;
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
        <h1 className="text-3xl font-bold mb-4">Volunteer at {mosqueName}</h1>
        <p className="text-gray-600 mb-8">
          Register your interest to volunteer at this mosque. They will be able to see your information and contact you when opportunities arise.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Volunteer Profile</CardTitle>
            <CardDescription>Tell the mosque about your skills and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="motivationMessage">Why do you want to volunteer at this mosque?</Label>
                <Textarea
                  id="motivationMessage"
                  placeholder="Share your motivation and what draws you to volunteer here..."
                  value={formData.motivationMessage}
                  onChange={(e) => setFormData({...formData, motivationMessage: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">About You</Label>
                <Textarea
                  id="description"
                  placeholder="Tell them about yourself and how you'd like to help"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
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
                <Label htmlFor="availability">Your Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, Weekday evenings, Flexible"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="timeCommitment">Time Commitment You Can Offer</Label>
                <Input
                  id="timeCommitment"
                  placeholder="e.g., 2-3 hours per week, One-time events, Ongoing"
                  value={formData.timeCommitment}
                  onChange={(e) => setFormData({...formData, timeCommitment: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="experience">Relevant Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe any relevant experience, qualifications, or background"
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
                  {submitting ? "Submitting..." : "Submit Volunteer Registration"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={`/mosques/${mosqueId}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}