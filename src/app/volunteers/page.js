'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Skills list for volunteers
const VOLUNTEER_SKILLS = [
  'Teaching',
  'Cooking',
  'Cleaning',
  'Administration',
  'Tech Support',
  'Social Media',
  'Event Planning',
  'Fundraising',
  'Graphic Design',
  'Childcare',
  'Elderly Care',
  'Driving',
  'Language Translation',
  'Counseling',
  'First Aid',
];

// Availability options
const AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekend mornings',
  'Weekend afternoons',
  'Weekend evenings',
  'Flexible',
];

// Validation schema for volunteer form
const volunteerFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }).optional(),
  skills: z.array(z.string()).min(1, { message: 'Please select at least one skill.' }),
  availability: z.array(z.string()).min(1, { message: 'Please select your availability.' }),
  experience: z.string().optional(),
  interests: z.string().min(10, { message: 'Please share what you\'re interested in helping with.' }),
  acceptTerms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions.' }),
});

export default function VolunteersPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(volunteerFormSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
      phone: '',
      skills: [],
      availability: [],
      experience: '',
      interests: '',
      acceptTerms: false,
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // In a real implementation, we would call the API
      // const response = await axios.post('/api/volunteers', data);

      // For demo purposes, just show a success toast
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: "Volunteer Application Submitted",
        description: "Thank you for volunteering! We'll be in touch soon.",
        variant: "success",
      });

      // Reset the form
      form.reset();

      // Redirect to a thank you page or dashboard
      // router.push('/volunteers/thank-you');
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.message || "There was a problem submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Volunteer Opportunities</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Join our community of volunteers helping local mosques and Islamic organizations. Share your skills and talents to make a difference.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Benefits and Information */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Volunteer?</CardTitle>
                <CardDescription>Benefits of joining our volunteer program</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Spiritual Rewards</h3>
                    <p className="text-gray-600 text-sm">Earn blessings by serving your community and supporting Islamic institutions.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Build Connections</h3>
                    <p className="text-gray-600 text-sm">Connect with like-minded individuals and build a stronger community network.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Develop Skills</h3>
                    <p className="text-gray-600 text-sm">Gain valuable experience while using your existing skills to help others.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Make a Difference</h3>
                    <p className="text-gray-600 text-sm">Contribute directly to important projects and initiatives in your community.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Volunteer Needs</CardTitle>
                <CardDescription>High-priority opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Ramadan Food Drive</h3>
                  <p className="text-sm text-gray-600 mt-1">Help organize and distribute food packages to families in need during Ramadan.</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Starts Soon
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Weekend Arabic School</h3>
                  <p className="text-sm text-gray-600 mt-1">Assist teachers with classroom activities and help children learn Arabic and Islamic studies.</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Ongoing - Weekends
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Tech Support Team</h3>
                  <p className="text-sm text-gray-600 mt-1">Help mosques with website maintenance, social media, and live streaming of events and prayers.</p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Flexible Hours
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Volunteer Sign-up Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Application</CardTitle>
              <CardDescription>
                Fill out the form below to join our volunteer team
                {!isLoggedIn && (
                  <span className="block mt-2 text-amber-600">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login first</Link> to auto-fill your information.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="skills"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Skills & Expertise</FormLabel>
                          <FormDescription>
                            Select skills you'd like to contribute
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {VOLUNTEER_SKILLS.map((skill) => (
                            <FormField
                              key={skill}
                              control={form.control}
                              name="skills"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={skill}
                                    className="flex flex-row items-start space-x-3 space-y-0"
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
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                      {skill}
                                    </FormLabel>
                                  </FormItem>
                                )
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
                    name="availability"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Availability</FormLabel>
                          <FormDescription>
                            When are you generally available to volunteer?
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {AVAILABILITY_OPTIONS.map((option) => (
                            <FormField
                              key={option}
                              control={form.control}
                              name="availability"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal text-sm">
                                      {option}
                                    </FormLabel>
                                  </FormItem>
                                )
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
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Volunteer Experience (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe any previous volunteer experience you have"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interests & Motivation</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What areas are you interested in volunteering with, and what motivates you to volunteer?"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the volunteer terms and conditions
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you agree to follow our volunteer guidelines and code of conduct.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
