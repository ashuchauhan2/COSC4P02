"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import React from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Create Supabase client inside the component with improved client implementation
  const getSupabase = () => {
    // Create the client with explicit session persistence
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,  // Ensure session is persisted
          storageKey: 'supabase.auth.token', // Match the key used elsewhere in the app
          detectSessionInUrl: true, // Detect session from URL hash
          flowType: 'pkce', // Use PKCE flow for better security
        }
      }
    );
  };

  // Determines initial protected route access - moved outside of useEffect to avoid conditional hook issues
  const isInProtectedRoute = pathname?.startsWith('/protected');
  
  // Pre-auth state management - ensures consistent state on initial render
  useEffect(() => {
    // Only apply this quick check if we're not in the middle of signing out
    if (!isSigningOut && isInProtectedRoute && !user) {
      setUser({ id: 'temp-user-id' } as User); // Temporarily assume logged in if in protected route
    }
  }, [isInProtectedRoute, user, isSigningOut]);

  // Create a ref to hold the Supabase client to avoid recreating it
  const supabaseRef = React.useRef<ReturnType<typeof getSupabase> | null>(null);

  // Initialize and track auth state with optimized implementation
  useEffect(() => {
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    setIsLoading(true);
    
    // Define a function to get or create the Supabase client
    const getOrCreateClient = () => {
      if (!supabaseRef.current) {
        supabaseRef.current = getSupabase();
      }
      return supabaseRef.current;
    };
    
    const initializeAuthState = async () => {
      try {
        // Get or create the Supabase client
        const supabase = getOrCreateClient();
        
        // First check the session - this is more reliable than getUser()
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (mounted && sessionData.session?.user) {
          setUser(sessionData.session.user);
          console.log("Session found on initialization");
        }
        
        // Set up auth state change listener with improved handler
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;
          
          console.log(`Auth state change: ${_event}`, !!session?.user);
          
          // Always update our user state when session changes
          setUser(session?.user ?? null);
          
          // Reset signing out state
          if (_event === 'SIGNED_OUT' || _event === 'SIGNED_IN') {
            setIsSigningOut(false);
          }
          
          // For sign-in and sign-out events, trigger a robust refresh
          if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
            // Two-stage refresh strategy
            // 1. Immediate state refresh
            if (mounted) {
              if (_event === 'SIGNED_IN') {
                console.log("User signed in - refreshing UI");
              } else if (_event === 'SIGNED_OUT') {
                console.log("User signed out - refreshing UI");
              }
            }
            
            // 2. Secondary router refresh after a delay
            setTimeout(() => {
              if (mounted) {
                router.refresh();
              }
            }, 300);
          }
        });
        
        authSubscription = subscription;
        
        // Final fallback - directly check user
        if (!sessionData.session && mounted) {
          const { data: userData, error } = await supabase.auth.getUser();
          
          if (error) {
            console.error("Auth user check error:", error);
            if (mounted) setUser(null);
          } else if (mounted && userData.user) {
            console.log("User found via getUser()");
            setUser(userData.user);
          }
        }
        
        if (mounted) setIsLoading(false);
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    
    // Run initialization immediately
    initializeAuthState();
    
    // Set up an interval to periodically check auth state
    // This helps catch edge cases where the listener might miss events
    const authCheckInterval = setInterval(async () => {
      try {
        if (!mounted) return;
        
        const supabase = getOrCreateClient();
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth interval check error:", error);
        } else if (mounted) {
          // Only update if different to avoid unnecessary renders
          const currentAuthState = !!user;
          const newAuthState = !!data.session?.user;
          
          if (currentAuthState !== newAuthState) {
            console.log("Auth state mismatch detected in interval check");
            setUser(data.session?.user ?? null);
            router.refresh();
          }
        }
      } catch (err) {
        console.error("Error in auth check interval:", err);
      }
    }, 10000); // Check every 10 seconds
    
    // Cleanup function
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      clearInterval(authCheckInterval);
    };
  }, [router]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSignOut = async () => {
    try {
      // Set signing out state to prevent route-based auth detection
      setIsSigningOut(true);
      
      // Perform the server-side sign-out operation - this is sufficient
      // The onAuthStateChange listener will handle UI updates
      const result = await signOutAction();
      
      // Only navigate after successful signout
      if (result.success) {
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Error signing out:', error);
      // Reset signing out state if there was an error
      setIsSigningOut(false);
    }
  };

  // Memoized auth state calculation with improved reliability
  const authState = React.useMemo(() => {
    // User with valid session takes precedence over everything else
    const hasValidUser = !!user && user.id !== 'temp-user-id';
    
    // Force unauthenticated view on login/signup pages regardless of session state
    const forceUnauthenticatedPaths = [
      '/sign-in', 
      '/sign-up', 
      '/forgot-password',
      '/verify',
      '/verify-reset-code'
    ];
    const isOnAuthPage = forceUnauthenticatedPaths.includes(pathname || '');
    
    // Auth detection with higher weight to actual user session
    // If we have a valid user session, authentication is true regardless
    // of anything else (except if signing out is in progress)
    const isAuthenticated = !isSigningOut && (
      hasValidUser || 
      (!isOnAuthPage && isInProtectedRoute) // Only use route-based inference if not on an auth page
    );
    
    // For debugging
    if (hasValidUser && !isSigningOut) {
      console.log("Authenticated via valid user session");
    } else if (!isSigningOut && !isOnAuthPage && isInProtectedRoute) {
      console.log("Authenticated via protected route inference");
    }
    
    // Final auth state calculation
    const showAuthenticatedUI = isAuthenticated && !isOnAuthPage;
    
    return {
      hasValidUser,
      isAuthenticated,
      isOnAuthPage,
      showAuthenticatedUI
    };
  }, [user, isSigningOut, isInProtectedRoute, pathname]);
  
  // Destructure for easier usage in JSX
  const { showAuthenticatedUI } = authState;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={showAuthenticatedUI ? "/protected/dashboard" : "/"}
            className="font-bold text-xl text-gray-800 dark:text-gray-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Course Mix
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {showAuthenticatedUI ? (
              <>
                <Link
                  href="/protected/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-1"
                >
                  Dashboard
                </Link>
                <div className="relative dropdown-container">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-1 gap-1"
                  >
                    Course Registration
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded mt-2 w-48 py-1 z-50">
                      <Link
                        href="/protected/course-registration"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Register
                      </Link>
                      <Link
                        href="/protected/my-courses"
                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        My Courses
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  href="/protected/academic-progress"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-1"
                >
                  Academic Progress
                </Link>
                <Link
                  href="/protected/course-reviews"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-1"
                >
                  Course Reviews
                </Link>
                <Link
                  href="/protected/profile"
                  className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-4 py-1"
                >
                  Profile
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-1 px-4"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col space-y-4">
              {showAuthenticatedUI ? (
                <>
                  <Link
                    href="/protected/dashboard"
                    className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="relative dropdown-container">
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-2 py-1 gap-1 w-full text-left"
                    >
                      Course Registration
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="relative bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900 rounded mt-2 w-48 py-1">
                        <Link
                          href="/protected/course-registration"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          Register
                        </Link>
                        <Link
                          href="/protected/my-courses"
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setIsMenuOpen(false);
                          }}
                        >
                          My Courses
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/protected/academic-progress"
                    className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Academic Progress
                  </Link>
                  <Link
                    href="/protected/course-reviews"
                    className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Course Reviews
                  </Link>
                  <Link
                    href="/protected/profile"
                    className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="flex-grow border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      Sign Out
                    </Button>
                    <ThemeToggle className="flex-shrink-0 rounded-full bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-2 hover:bg-gray-100 dark:hover:bg-gray-700/70" />
                  </div>
                </>
              ) : (
                <>
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)} className="flex-grow">
                      <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                        Register
                      </Button>
                    </Link>
                    <ThemeToggle className="flex-shrink-0 rounded-full bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-2 hover:bg-gray-100 dark:hover:bg-gray-700/70" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
