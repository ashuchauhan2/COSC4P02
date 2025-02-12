"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          const { data: verificationData } = await supabase
            .from("user_verification")
            .select("is_verified")
            .eq("email", session.user.email)
            .single();

          if (verificationData?.is_verified) {
            setUser(session.user);
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setLoading(true);

      try {
        if (session?.user) {
          const { data: verificationData } = await supabase
            .from("user_verification")
            .select("is_verified")
            .eq("email", session.user.email)
            .single();

          if (verificationData?.is_verified) {
            setUser(session.user);
            if (event === "SIGNED_IN") {
              router.push("/protected/dashboard");
            }
          } else {
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
          if (event === "SIGNED_OUT") {
            router.push("/");
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Only redirect on logo click
  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user) {
      router.push("/protected/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={user ? "/protected/dashboard" : "/"}
            onClick={handleLogoClick}
            className="font-bold text-xl text-gray-800 hover:text-teal-600 transition-colors"
          >
            Course Mix
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/protected/dashboard"
                  className="text-gray-600 hover:text-teal-600 transition-colors px-4 py-1"
                >
                  Dashboard
                </Link>
                <Link
                  href="/protected/course-registration"
                  className="text-gray-600 hover:text-teal-600 transition-colors px-4 py-1"
                >
                  Course Registration
                </Link>
                <Link
                  href="/protected/grades"
                  className="text-gray-600 hover:text-teal-600 transition-colors px-4 py-1"
                >
                  Grades
                </Link>
                <Link
                  href="/protected/course-reviews"
                  className="text-gray-600 hover:text-teal-600 transition-colors px-4 py-1"
                >
                  Course Reviews
                </Link>
                <Link
                  href="/protected/profile"
                  className="text-gray-600 hover:text-teal-600 transition-colors px-4 py-1"
                >
                  Profile
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors py-1 px-4"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
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
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-teal-600 hover:bg-gray-50 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {user ? (
                <>
                  <Link
                    href="/protected/dashboard"
                    className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/protected/course-registration"
                    className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Course Registration
                  </Link>
                  <Link
                    href="/protected/grades"
                    className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Grades
                  </Link>
                  <Link
                    href="/protected/course-reviews"
                    className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Course Reviews
                  </Link>
                  <Link
                    href="/protected/profile"
                    className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
