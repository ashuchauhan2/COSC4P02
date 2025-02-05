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
    <nav className="bg-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <Link href="/" className="font-bold text-xl text-white ">
            Logo
          </Link>
        </div>
        <div>
          {user ? (
            <>
              <Link href="/dashboard" className="mr-4 hover:text-blue-500">
                Dashboard
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/signin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-3">
                Sign In
              </Link>
              <Link href="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
} 