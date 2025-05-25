"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VolunteersPage() {
  const { data: session, status } = useSession();
  const [volunteerNeeds, setVolunteerNeeds] = useState([]);
  const [volunteerOffers, setVolunteerOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    try {
      const [needsRes, offersRes] = await Promise.all([
        fetch('/api/volunteers/needs'),
        fetch('/api/volunteers/offers')
      ]);
      
      if (needsRes.ok) {
        const needsData = await needsRes.json();
        setVolunteerNeeds(needsData.data || []);
      }
      
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setVolunteerOffers(offersData.data || []);
      }
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canPostOffer = status === "authenticated" && session?.user?.role === "user";
  const canPostNeed = status === "authenticated" && (session?.user?.role === "imam" || session?.user?.role === "admin");

  return (
    <div className="container py-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Volunteer Hub</h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect volunteer opportunities with community members who want to help.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {canPostOffer && (
              <Button asChild>
                <Link href="/volunteers/post-offer">Post Volunteer Offer</Link>
              </Button>
            )}
            {canPostNeed && (
              <Button variant="outline" asChild>
                <Link href="/volunteers/post-need">Post Volunteer Need</Link>
              </Button>
            )}
            {status !== "authenticated" && (
              <Button asChild>
                <Link href="/login?callbackUrl=/volunteers">Login to Participate</Link>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="needs" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="needs">Volunteer Needs</TabsTrigger>
            <TabsTrigger value="offers">Volunteer Offers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="needs" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Mosques Need Volunteers</h2>
              <p className="text-gray-600">Help your local mosques with their community needs</p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading volunteer needs...</div>
            ) : volunteerNeeds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No volunteer needs posted yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {volunteerNeeds.map((need) => (
                  <Card key={need._id} className="h-full flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{need.title}</CardTitle>
                        <Badge variant={need.urgency === 'high' ? 'destructive' : need.urgency === 'medium' ? 'default' : 'secondary'}>
                          {need.urgency}
                        </Badge>
                      </div>
                      <CardDescription>{need.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">Category: </span>
                          <Badge variant="outline">{need.category}</Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Time: </span>
                          <span className="text-sm text-gray-600">{need.timeCommitment}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Volunteers Needed: </span>
                          <span className="text-sm text-gray-600">{need.volunteersNeeded}</span>
                        </div>
                        {need.skillsRequired?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Skills: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {need.skillsRequired.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {status === "authenticated" ? (
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/volunteers/apply?needId=${need._id}`}>Apply</Link>
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full" variant="outline" asChild>
                          <Link href="/login?callbackUrl=/volunteers">Login to Apply</Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="offers" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Community Members Offering Help</h2>
              <p className="text-gray-600">Connect with volunteers ready to serve</p>
            </div>
            
            {loading ? (
              <div className="text-center py-8">Loading volunteer offers...</div>
            ) : volunteerOffers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No volunteer offers posted yet.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {volunteerOffers.map((offer) => (
                  <Card key={offer._id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <CardDescription>{offer.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium">Category: </span>
                          <Badge variant="outline">{offer.category}</Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Availability: </span>
                          <span className="text-sm text-gray-600">{offer.availability}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Time Commitment: </span>
                          <span className="text-sm text-gray-600">{offer.timeCommitment}</span>
                        </div>
                        {offer.skillsOffered?.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Skills: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {offer.skillsOffered.map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      {canPostNeed ? (
                        <Button size="sm" className="w-full">
                          Contact Volunteer
                        </Button>
                      ) : (
                        <Button size="sm" className="w-full" variant="outline" disabled>
                          Contact Info Hidden
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}