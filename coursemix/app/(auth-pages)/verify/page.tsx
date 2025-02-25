"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Message, SearchParamsMessage } from "@/components/ui/message";

// A separate component to handle the email parameter from searchParams
function EmailProvider({ children }: { children: (email: string | null) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  return <>{children(email)}</>;
}

// Create a wrapper for SearchParamsMessage with Suspense
function SearchParamsWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-6"></div>}>
      <SearchParamsMessage />
    </Suspense>
  );
}

export default function VerifyEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [step, setStep] = useState<'verify' | 'create-password'>('verify');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  
  const router = useRouter();
  
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip any non-numeric characters and limit to 6 digits
    const cleanedValue = e.target.value.replace(/\D/g, '').substring(0, 6);
    setVerificationCode(cleanedValue);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, email: string | null) => {
    e.preventDefault();
    
    if (!email) {
      router.push("/sign-up");
      return;
    }
    
    if (verificationCode.length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Submitting verification:", { email, code: verificationCode });
      
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
        }),
      });
      
      const data = await response.json();
      console.log("Verification response:", data);
      
      if (!response.ok) {
        setError(data.error || "Verification failed. Please try again.");
      } else {
        // If verification was successful, move to password creation step
        setVerifiedEmail(data.email);
        setStep('create-password');
        setSuccess("Email verified successfully! Please create a password for your account.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Completing registration");
      
      const response = await fetch("/api/auth/complete-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verifiedEmail,
          password,
        }),
      });
      
      const data = await response.json();
      console.log("Registration completion response:", data);
      
      if (!response.ok) {
        setError(data.error || "Failed to create account. Please try again.");
      } else {
        setSuccess("Account created successfully! Redirecting to login...");
        // Redirect to sign-in after a short delay
        setTimeout(() => {
          router.push("/sign-in");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration completion error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async (email: string | null) => {
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          resendOnly: true,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Failed to resend code. Please try again.");
      } else {
        setSuccess("Verification code resent! Please check your email.");
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Resend error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>}>
      <EmailProvider>
        {(email) => {
          // If there's no email in the URL, redirect to sign-up
          if (!email && typeof window !== 'undefined') {
            router.push("/sign-up");
            return <Loader2 className="h-8 w-8 animate-spin text-teal-600" />;
          }
          
          return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-8">
              <div className="w-full max-w-md space-y-8">
                {/* Logo/Brand Section */}
                <div className="text-center">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    Course Mix
                  </h1>
                  <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                    {step === 'verify' ? 'Verify your email' : 'Create your password'}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {step === 'verify' 
                      ? `Please enter the verification code sent to ${email}` 
                      : 'Your email has been verified. Now create a secure password for your account.'}
                  </p>
                </div>

                {/* Verification or Password Creation Form */}
                <div className="mt-8 bg-white px-6 py-8 shadow-xl rounded-xl border border-gray-100">
                  <SearchParamsWrapper />
                  
                  {error && (
                    <Message
                      type="error"
                      message={error}
                      onDismiss={() => setError(null)}
                    />
                  )}
                  
                  {success && (
                    <Message
                      type="success"
                      message={success}
                      onDismiss={() => setSuccess(null)}
                    />
                  )}
                  
                  {step === 'verify' ? (
                    // Verification Code Form
                    <form className="space-y-6" onSubmit={(e) => handleSubmit(e, email)}>
                      <div>
                        <label 
                          htmlFor="verificationCode" 
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Verification Code
                        </label>
                        <div className="mt-2">
                          <Input
                            id="verificationCode"
                            name="verificationCode"
                            type="text"
                            required
                            className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500 text-center tracking-widest text-xl font-medium"
                            placeholder="Enter code"
                            value={verificationCode}
                            onChange={handleVerificationCodeChange}
                            maxLength={6}
                            pattern="\d{6}"
                            inputMode="numeric"
                          />
                        </div>
                      </div>

                      <div>
                        <Button 
                          type="submit" 
                          className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-70"
                          disabled={isLoading || verificationCode.length !== 6}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            'Verify Email'
                          )}
                        </Button>
                      </div>
                      
                      <div className="mt-6 text-center">
                        <button
                          type="button"
                          onClick={() => handleResendCode(email)}
                          className="text-sm font-medium text-teal-600 hover:text-teal-500 transition-colors"
                          disabled={isLoading}
                        >
                          Resend verification code
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Password Creation Form
                    <form className="space-y-6" onSubmit={handlePasswordSubmit}>
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
                            required
                            className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Must be at least 8 characters long
                        </p>
                      </div>
                      
                      <div>
                        <label 
                          htmlFor="confirmPassword" 
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Confirm Password
                        </label>
                        <div className="mt-2">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={8}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Button 
                          type="submit" 
                          className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-70"
                          disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            'Complete Registration'
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          );
        }}
      </EmailProvider>
    </Suspense>
  );
} 