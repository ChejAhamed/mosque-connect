"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the schema for business registration
const businessRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  ownerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Please select a business type"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  website: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  requestHalalCertification: z.boolean().default(false),
  halalDetails: z.string().optional(),
  supplierInfo: z.string().optional(),
});

const businessTypes = [
  "Restaurant",
  "Grocery Store",
  "Butcher Shop",
  "Bakery",
  "Cafe",
  "Food Manufacturer",
  "Catering Service",
  "Convenience Store",
  "Other",
];

export default function BusinessRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      email: "",
      password: "",
      phone: "",
      description: "",
      type: "",
      address: "",
      city: "",
      postalCode: "",
      website: "",
      termsAccepted: false,
      requestHalalCertification: false,
      halalDetails: "",
      supplierInfo: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      // Create the business account
      const response = await axios.post("/api/business/register", values);

      toast({
        title: "Registration Successful",
        description: "Your business account has been created. Please log in.",
      });

      // If halal certification was requested, show toast about it
      if (values.requestHalalCertification) {
        toast({
          title: "Halal Certification Request",
          description: "Your request for halal certification has been submitted for review.",
        });
      }

      // Sign in the user
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (signInResult.error) {
        toast({
          title: "Login Failed",
          description: "Please try logging in manually.",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        router.push("/dashboard/business");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const currentFields = step === 1
      ? ["ownerName", "email", "password", "phone"]
      : ["name", "description", "type", "address", "city", "postalCode", "website"];

    const isValid = currentFields.every(field => {
      const result = form.trigger(field);
      return result;
    });

    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Step 1: Account Information Form
  const renderStep1 = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="ownerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Your Name*</FormLabel>
            <FormControl>
              <Input placeholder="Full Name" {...field} />
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
            <FormLabel>Email*</FormLabel>
            <FormControl>
              <Input type="email" placeholder="you@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password*</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Create a secure password"
                {...field}
              />
            </FormControl>
            <FormDescription>
              At least 8 characters with letters and numbers
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number*</FormLabel>
            <FormControl>
              <Input placeholder="Phone Number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="pt-4">
        <Button
          type="button"
          onClick={nextStep}
          className="w-full md:w-auto"
        >
          Next: Business Details
        </Button>
      </div>
    </div>
  );

  // Step 2: Business Details Form
  const renderStep2 = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name*</FormLabel>
            <FormControl>
              <Input placeholder="Your Business Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Description*</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your business"
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
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Type*</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address*</FormLabel>
              <FormControl>
                <Input placeholder="Street Address" {...field} />
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
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postal Code*</FormLabel>
              <FormControl>
                <Input placeholder="Postal Code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://yourbusiness.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={nextStep}
        >
          Next: Halal Certification
        </Button>
      </div>
    </div>
  );

  // Step 3: Halal Certification and Terms
  const renderStep3 = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Halal Certification</CardTitle>
          <CardDescription>
            Request halal certification for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="requestHalalCertification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Request Halal Certification</FormLabel>
                    <FormDescription>
                      Check this box if you would like your business to be certified as Halal
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("requestHalalCertification") && (
              <>
                <FormField
                  control={form.control}
                  name="halalDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Halal Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details about your products and processes that make them halal-compliant"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include information about your ingredients, preparation methods, and any existing halal certifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplierInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide information about your suppliers, especially for meat and other animal products"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        An imam will review your application and may contact you for additional information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <FormField
        control={form.control}
        name="termsAccepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Terms and Conditions*</FormLabel>
              <FormDescription>
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  terms and conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  privacy policy
                </Link>
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={prevStep}
          variant="outline"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registering..." : "Register Business"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Register Your Business</h1>
          <p className="text-gray-600">
            Join our community of Muslim-owned and halal-friendly businesses
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between">
            <div className={`flex-1 p-2 text-center border-b-2 ${step === 1 ? 'border-green-500 text-green-500 font-medium' : 'border-gray-200 text-gray-400'}`}>
              1. Account Information
            </div>
            <div className={`flex-1 p-2 text-center border-b-2 ${step === 2 ? 'border-green-500 text-green-500 font-medium' : 'border-gray-200 text-gray-400'}`}>
              2. Business Details
            </div>
            <div className={`flex-1 p-2 text-center border-b-2 ${step === 3 ? 'border-green-500 text-green-500 font-medium' : 'border-gray-200 text-gray-400'}`}>
              3. Halal Certification & Terms
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </form>
        </Form>

        <div className="mt-8 text-center text-gray-600 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
