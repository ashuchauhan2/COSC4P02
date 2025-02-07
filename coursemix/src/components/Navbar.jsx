"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Check if user is verified before setting user state
        const { data: verificationData } = await supabase
          .from('user_verification')
          .select('is_verified')
          .eq('email', session.user.email)
          .single();

        if (verificationData?.is_verified) {
          setUser(session.user);
          if (event === 'SIGNED_IN') {
            router.push('/dashboard');
          }
        } else {
          // Sign out if not verified
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
        if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Check verification status on initial load
        const { data: verificationData } = await supabase
          .from('user_verification')
          .select('is_verified')
          .eq('email', session.user.email)
          .single();

        if (!verificationData?.is_verified) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(session.user);
        }
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Only redirect on logo click
  const handleLogoClick = (e) => {
    e.preventDefault()
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href={user ? "/dashboard" : "/"} 
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
                  href="/dashboard" 
                  className="text-gray-600 hover:text-teal-600 transition-colors"
                >
                  Dashboard
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
                <Link href="/signin">
                  <Button 
                    variant="outline"
                    className="border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                  >
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
                    href="/dashboard" 
                    className="text-gray-600 hover:text-teal-600 transition-colors px-2 py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
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
                  <Link 
                    href="/signin"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button 
                      variant="outline"
                      className="w-full border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link 
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button 
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                    >
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
  )
} 