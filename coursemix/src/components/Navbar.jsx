"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Navbar() {
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
  }

  return (
    <nav className="bg-white p-4"> {/* Corrected class names and spacing */}
      <div className="container mx-auto flex justify-between items-center"> {/* Added container and flexbox */}
        <div>
          <Link href="/" className="font-bold text-xl"> {/* Added font-bold and text-xl */}
            Logo{/* Or an image component */}
          </Link>
        </div>
        <div> {/* Wrap links in a div for better alignment */}
          <Link href="/signin" className="mr-4 hover:text-blue-500"> {/* Added margin and hover effect */}
            Sign In
          </Link>
          <Link href="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
} 