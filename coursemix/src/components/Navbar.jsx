"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <Link href="/" className="font-bold text-xl text-gray-800 hover:text-teal-600 transition-colors">
            Course Mix
          </Link>
        </div>
        <div className="flex items-center gap-4">
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
      </div>
    </nav>
  )
} 