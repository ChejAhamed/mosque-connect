"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function VolunteersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [canVolunteer, setCanVolunteer] = useState(false);

  useEffect(() => {
    // Check if the user is a community member and not already a volunteer
    if (status === "authenticated" &&
        session?.user?.role === "user" &&
        session?.user?.volunteerStatus === "not_volunteer") {
      setCanVolunteer(true);
    } else {
      setCanVolunteer(false);
    }
  }, [status, session]);

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Volunteer Opportunities</h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect with mosques in your community and offer your skills to make a difference.
          </p>

          {canVolunteer && (
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600" asChild>
              <Link href="/volunteer/become">Become a Volunteer</Link>
            </Button>
          )}

          {status === "authenticated" && session?.user?.volunteerStatus === "pending" && (
            <Alert className="bg-yellow-50 text-yellow-700 border border-yellow-200 mt-4">
              <AlertDescription>
                Your volunteer application is currently pending approval. We'll notify you once it's reviewed.
              </AlertDescription>
            </Alert>
          )}

          {status === "authenticated" && session?.user?.volunteerStatus === "active" && (
            <Alert className="bg-green-50 text-green-700 border border-green-200 mt-4">
              <AlertDescription>
                You are an active volunteer! Check your profile for current assignments.
              </AlertDescription>
            </Alert>
          )}

          {status === "authenticated" && session?.user?.role !== "user" && (
            <Alert className="bg-blue-50 text-blue-700 border border-blue-200 mt-4">
              <AlertDescription>
                Only community members can register as volunteers. Your current role is {session?.user?.role}.
              </AlertDescription>
            </Alert>
          )}

          {status !== "authenticated" && (
            <Alert className="bg-gray-50 border border-gray-200 mt-4">
              <AlertDescription>
                <Link href="/login?callbackUrl=/volunteers" className="text-blue-600 hover:underline">
                  Login
                </Link>{" "}
                or{" "}
                <Link href="/register?role=user" className="text-blue-600 hover:underline">
                  Register
                </Link>{" "}
                as a community member to become a volunteer.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {[
            {
              title: "Cleaning & Maintenance",
              description: "Help keep our mosques clean and well-maintained.",
              skills: ["Cleaning", "Gardening", "Maintenance"],
              color: "blue",
            },
            {
              title: "Education Programs",
              description: "Assist with teaching Quran, Islamic studies, and language classes.",
              skills: ["Teaching", "Childcare", "Curriculum Development"],
              color: "green",
            },
            {
              title: "Event Organization",
              description: "Help plan and run community events, iftars, and fundraisers.",
              skills: ["Event Planning", "Coordination", "Marketing"],
              color: "purple",
            },
            {
              title: "Technical Support",
              description: "Assist with IT, website management, and social media.",
              skills: ["IT Support", "Web Development", "Social Media"],
              color: "indigo",
            },
            {
              title: "Administration",
              description: "Help with office work, accounting, and general administration.",
              skills: ["Administration", "Accounting", "Organization"],
              color: "pink",
            },
            {
              title: "Community Outreach",
              description: "Support dawah activities and community engagement initiatives.",
              skills: ["Communication", "Networking", "Public Relations"],
              color: "yellow",
            },
          ].map((opportunity, index) => (
            <Card key={index} className="h-full flex flex-col">
              <CardHeader className={`bg-${opportunity.color}-50 border-b border-${opportunity.color}-100`}>
                <CardTitle className={`text-${opportunity.color}-800`}>{opportunity.title}</CardTitle>
                <CardDescription>{opportunity.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow py-4">
                <h4 className="text-sm font-medium mb-2">Skills Needed:</h4>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-gray-50">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                {canVolunteer ? (
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/volunteer/become">Apply Now</Link>
                  </Button>
                ) : status !== "authenticated" ? (
                  <Button size="sm" className="w-full" variant="outline" asChild>
                    <Link href="/login?callbackUrl=/volunteers">Login to Apply</Link>
                  </Button>
                ) : (
                  <Button size="sm" className="w-full" variant="outline" disabled>
                    {session?.user?.volunteerStatus === "pending"
                      ? "Application Pending"
                      : session?.user?.volunteerStatus === "active"
                        ? "Already Volunteering"
                        : "Not Available"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-medium mb-2">Register</h3>
              <p className="text-gray-600">
                Sign up as a community member and then apply to become a volunteer.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-medium mb-2">Share Your Skills</h3>
              <p className="text-gray-600">
                Tell us about your skills and availability to serve the community.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-medium mb-2">Get Matched</h3>
              <p className="text-gray-600">
                We'll connect you with mosques that need your specific skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
