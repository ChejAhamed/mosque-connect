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
import { Badge } from "@/components/ui/badge";

export default function VolunteerApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const needId = searchParams.get('needId');
  
  const [volunteerNeed, setVolunteerNeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    experience: "",
    availability: "",
  });

  useEffect(() => {
    if (needId) {
      fetchVolunteerNeed();
    } else {
      setLoading(false);
    }
  }, [needId]);

  const fetchVolunteerNeed = async () => {
    try {
      const response = await fetch(`/api/volunteers/needs/${needId}`);
      if (response.ok) {
        const data = await response.json();
        setVolunteerNeed(data.data);
      }
    } catch (error) {
      console.error('Error fetching volunteer need:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/volunteers/needs/${needId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/volunteers?applied=true');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="container py-10 text-center">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Please <Link href="/login" className="text-blue-600 hover:underline">login</Link> to apply for volunteer opportunities.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!needId || !volunteerNeed) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>
            Volunteer opportunity not found. <Link href="/volunteers" className="text-blue-600 hover:underline">Browse opportunities</Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Apply for Volunteer Opportunity</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{volunteerNeed.title}</CardTitle>
            <CardDescription>{volunteerNeed.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <span className="font-medium">Category: </span>
                <Badge variant="outline">{volunteerNeed.category}</Badge>
              </div>
              <div>
                <span className="font-medium">Time Commitment: </span>
                <span className="text-gray-600">{volunteerNeed.timeCommitment}</span>
              </div>
              <div>
                <span className="font-medium">Volunteers Needed: </span>
                <span className="text-gray-600">{volunteerNeed.volunteersNeeded}</span>
              </div>
              {volunteerNeed.skillsRequired?.length > 0 && (
                <div>
                  <span className="font-medium">Skills Required: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {volunteerNeed.skillsRequired.map((skill, i) => (
                      <Badge key={i} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Application</CardTitle>
            <CardDescription>Tell us why you'd like to volunteer for this opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="message">Message to Organizers</Label>
                <Textarea
                  id="message"
                  placeholder="Why are you interested in this opportunity? What makes you a good fit?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="experience">Relevant Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe any relevant experience or skills you have"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="availability">Your Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, Evenings, Flexible"
                  value={formData.availability}
                  onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Application"}
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