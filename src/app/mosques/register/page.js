"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

// Define the schema for mosque registration
const mosqueRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  website: z.string().url("Invalid URL format").optional().or(z.literal("")),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
  facilityFeatures: z.array(z.string()).default([]),
  lookupCoordinates: z.boolean().default(true)
});

const facilityFeatureOptions = [
  { id: "prayer-hall", label: "Prayer Hall" },
  { id: "womens-section", label: "Women's Section" },
  { id: "parking", label: "Parking" },
  { id: "wheelchair-access", label: "Wheelchair Access" },
  { id: "wudu-facilities", label: "Wudu Facilities" },
  { id: "shoe-racks", label: "Shoe Racks" },
  { id: "quran-classes", label: "Quran Classes" },
  { id: "islamic-library", label: "Islamic Library" },
  { id: "funeral-services", label: "Funeral Services" },
  { id: "community-hall", label: "Community Hall" },
  { id: "kitchen", label: "Kitchen" },
  { id: "multilingual-services", label: "Multilingual Services" },
];

export default function RegisterMosquePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  const form = useForm({
    resolver: zodResolver(mosqueRegistrationSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      website: "",
      description: "",
      imageUrl: "",
      facilityFeatures: [],
      lookupCoordinates: true
    },
  });

  // Function to convert address to coordinates using Google Maps Geocoding API
  const getCoordinatesFromAddress = async (address, city, state, zipCode) => {
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          fullAddress
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU'}`
      );

      if (response.data.status === "OK" && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return [lng, lat]; // GeoJSON format is [longitude, latitude]
      }

      return [0, 0]; // Default if geocoding fails
    } catch (error) {
      console.error("Error geocoding address:", error);
      return [0, 0]; // Default if geocoding fails
    }
  };

  const onSubmit = async (values) => {
    // Check if user is logged in
    if (status !== "authenticated") {
      toast({
        title: "Authentication Required",
        description: "You must be logged in as an imam or admin to register a mosque.",
        variant: "destructive",
      });
      router.push("/login?callbackUrl=/mosques/register");
      return;
    }

    // Check if user has appropriate role
    if (session.user.role !== "imam" && session.user.role !== "admin") {
      toast({
        title: "Authorization Error",
        description: "Only imams and admins can register mosques.",
        variant: "destructive",
      });
      router.push("/unauthorized");
      return;
    }

    setIsSubmitting(true);

    try {
      // If geocoding is enabled, get coordinates
      let coordinates = [0, 0];
      if (values.lookupCoordinates) {
        coordinates = await getCoordinatesFromAddress(
          values.address,
          values.city,
          values.state,
          values.zipCode
        );
      }

      // Prepare data with coordinates
      const mosqueData = {
        ...values,
        location: {
          type: "Point",
          coordinates: coordinates
        }
      };

      // Remove helper field not needed in the API
      delete mosqueData.lookupCoordinates;

      // Register mosque
      const response = await axios.post("/api/mosques", mosqueData);

      toast({
        title: "Mosque Registered",
        description: "The mosque has been successfully registered.",
      });

      // Redirect to mosque page
      router.push(`/mosques/${response.data.mosque._id}`);
    } catch (error) {
      console.error("Error registering mosque:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || "Failed to register mosque.";

      if (typeof errorMessage === 'string') {
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "There was an error registering the mosque. Please check your input and try again.",
          variant: "destructive",
        });
        console.error("Detailed error:", errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register a Mosque</h1>
          <p className="text-gray-600">
            Add your mosque to our directory to help the community find your services.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Mosque Information</CardTitle>
            <CardDescription>
              Fill in the details of the mosque you would like to register.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mosque Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the mosque name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a description of the mosque"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include information about the mosque's history, services, and community.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City*</FormLabel>
                        <FormControl>
                          <Input placeholder="London" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/County*</FormLabel>
                        <FormControl>
                          <Input placeholder="Greater London" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code*</FormLabel>
                        <FormControl>
                          <Input placeholder="SW1A 1AA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="020 1234 5678" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
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
                          <Input
                            type="email"
                            placeholder="contact@mosquename.org"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://www.mosquename.org"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/mosque-image.jpg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="facilityFeatures"
                  render={() => (
                    <FormItem>
                      <FormLabel>Facilities</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {facilityFeatureOptions.map((feature) => (
                          <FormField
                            key={feature.id}
                            control={form.control}
                            name="facilityFeatures"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={feature.id}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, feature.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== feature.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {feature.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormDescription>
                        Select all facilities that this mosque provides.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lookupCoordinates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 border p-4 rounded-md">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Use Google Maps for Location
                        </FormLabel>
                        <FormDescription>
                          Automatically lookup mosque coordinates for displaying on the map.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register Mosque"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
