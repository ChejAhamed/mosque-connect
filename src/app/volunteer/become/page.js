"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VOLUNTEER_SKILLS, TIME_SLOTS, DAYS_OF_WEEK } from "@/lib/constants";

const formSchema = z.object({
  skills: z.array(z.string()).min(1, {
    message: "Please select at least one skill."
  }),
  otherSkills: z.string().optional(),
  availability: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional(),
    sunday: z.array(z.string()).optional(),
  }).refine(
    (data) => {
      // Check if at least one day has at least one time slot selected
      return Object.values(data).some(
        (timeSlots) => timeSlots && timeSlots.length > 0
      );
    },
    {
      message: "Please select at least one time slot.",
      path: ["root"],
    }
  ),
  isVisibleToAllMosques: z.boolean().default(false),
});

export default function BecomeVolunteerPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/volunteer/become");
    }
  }, [status, router]);

  // Check if the current user is not a community member
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "user") {
      setError("Only community members can register as volunteers. Please switch to a community member account.");
    }
  }, [status, session]);

  // Check if user is already a volunteer
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.volunteerStatus &&
      session.user.volunteerStatus !== "not_volunteer"
    ) {
      if (session.user.volunteerStatus === "pending") {
        setSuccess("Your volunteer application is pending approval.");
      } else if (session.user.volunteerStatus === "active") {
        setSuccess("You are already an active volunteer.");
      }
    }
  }, [status, session]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: [],
      otherSkills: "",
      availability: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      },
      isVisibleToAllMosques: false,
    },
  });

  const onSubmit = async (values) => {
    if (!session?.user) {
      setError("You must be logged in to become a volunteer.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Call the API to register as a volunteer
      const response = await axios.post("/api/volunteer/register", values);

      if (response.data.success) {
        setSuccess("Your volunteer application has been submitted successfully.");

        // Update the session to reflect the new volunteer status
        await update({
          ...session,
          user: {
            ...session.user,
            volunteerStatus: "pending",
          },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to register as a volunteer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not authenticated, show a message (this should rarely happen because of the redirect)
  if (!session) {
    return (
      <div className="container py-10">
        <Alert className="bg-yellow-50 border border-yellow-200">
          <AlertDescription>
            You need to be logged in to register as a volunteer.{" "}
            <Link href="/login?callbackUrl=/volunteer/become" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Become a Volunteer</CardTitle>
          <CardDescription>
            Share your skills and availability to help your local community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 bg-red-50 text-red-700 border border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-700 border border-green-200">
              <AlertDescription>
                {success}{" "}
                <Link href="/profile" className="font-medium underline">
                  Go to your profile
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {!success && session?.user?.role === "user" && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">Skills</FormLabel>
                      <FormDescription>
                        Select the skills you can offer to mosques and the community.
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {VOLUNTEER_SKILLS.map((skill) => (
                          <FormField
                            key={skill}
                            control={form.control}
                            name="skills"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={skill}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(skill)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, skill])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== skill
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {skill}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="otherSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Skills</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter any other skills you have..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        List any additional skills not mentioned above.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium mb-1">Availability</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Select the days and times you are available to volunteer.
                    </p>
                  </div>

                  {/* Days of the week */}
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="space-y-2">
                      <FormLabel className="capitalize">{day}</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TIME_SLOTS.map((timeSlot) => (
                          <FormField
                            key={`${day}-${timeSlot}`}
                            control={form.control}
                            name={`availability.${day}`}
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={timeSlot}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(timeSlot)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        return checked
                                          ? field.onChange([...currentValue, timeSlot])
                                          : field.onChange(
                                              currentValue.filter((value) => value !== timeSlot)
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm">
                                    {timeSlot}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  {form.formState.errors.availability?.root && (
                    <p className="text-sm font-medium text-red-500 mt-2">
                      {form.formState.errors.availability.root.message}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="isVisibleToAllMosques"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Make my profile visible to all mosques</FormLabel>
                        <FormDescription>
                          If checked, all mosques in the directory can see your volunteer profile.
                          Otherwise, only mosques you specifically apply to will see your information.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Register as Volunteer"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/profile">Go to Profile</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
