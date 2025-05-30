"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

// Loading fallback for Suspense
function LoginFormSkeleton() {
  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
              </div>
            ))}
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// The actual login form component
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const registered = searchParams?.get("registered");
  const registeredEmail = searchParams?.get("email") || "";
  const error = searchParams?.get("error");

  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: registeredEmail || "",
      password: "",
    },
  });

  useEffect(() => {
    if (registered === "true" && registeredEmail) {
      setSuccessMessage(`Registration successful! You can now log in with ${registeredEmail}.`);
    }

    if (error) {
      if (error === "CredentialsSignin") {
        setLoginError("Invalid email or password. Please try again. You can use the demo login option below.");
      } else if (error === "DatabaseConnection") {
        setLoginError("Unable to connect to the database. Please try the demo login or try again later.");
      } else {
        setLoginError("An error occurred during login. Please try again or use the demo login option.");
      }
    }
  }, [registered, registeredEmail, error]);

  async function onSubmit(values) {
    setIsLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setLoginError("Invalid email or password. Please try again or use the demo login option.");
        } else {
          setLoginError(`Login error: ${result.error}. You can try the demo login below.`);
        }
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("An error occurred during login. Please try again or use the demo login option.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin() {
    setIsDemoLoading(true);
    setLoginError("");

    try {
      const result = await signIn("credentials", {
        email: "demo@example.com",
        password: "password",
        redirect: false,
      });

      if (result?.error) {
        setLoginError(`Demo login failed: ${result.error}. Please try again later.`);
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setLoginError("An error occurred during demo login. Please try again later.");
    } finally {
      setIsDemoLoading(false);
    }
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-700">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {loginError && (
            <Alert className="mb-4 bg-red-50 text-red-700">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading || isDemoLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500 mb-2">Or continue with</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDemoLogin}
              disabled={isLoading || isDemoLoading}
            >
              {isDemoLoading ? "Logging in..." : "Demo Login"}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              No account needed. Use demo login to try the application.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-600 hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Default export with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
