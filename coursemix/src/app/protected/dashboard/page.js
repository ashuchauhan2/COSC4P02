"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RequireAuth from '@/components/RequireAuth'
import NewProfileSetup from '@/components/NewProfileSetup'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
      }
      setUser(session.user)
    }

    checkAuth()
  }, [router])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <RequireAuth>
      <NewProfileSetup />
    </RequireAuth>
  )
} 