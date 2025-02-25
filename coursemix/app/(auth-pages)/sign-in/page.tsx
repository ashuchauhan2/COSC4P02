"use client";

import { signInAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Message, SearchParamsMessage } from "@/components/ui/message";

// Create a wrapper for SearchParamsMessage
function SearchParamsWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-6"></div>}>
      <SearchParamsMessage />
    </Suspense>
  );
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const result = await signInAction(formData);
      
      if (result.success) {
        // Wait a brief moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/protected/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Course Mix
          </h1>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to your dashboard
          </p>
        </div>

        {/* Sign In Form */}
        <div className="mt-8 bg-white px-6 py-8 shadow-xl rounded-xl border border-gray-100">
          <SearchParamsWrapper />
          
          {error && (
            <Message
              type="error"
              message={error}
              onDismiss={() => setError(null)}
            />
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-medium text-teal-600 hover:text-teal-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  New to Course Mix?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/sign-up" className="w-full block">
                <Button 
                  variant="outline" 
                  className="w-full h-11 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
