"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RequireAuth from '@/components/RequireAuth'
import TimeTable from '@/components/TimeTable'
import DegreeProgress from '@/components/DegreeProgressBar'
import Spinner from '@/components/Spinner'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signin')
        return
      }
      setUser(session.user)
      // console.log('User ID:', session.user.id) // Debug log
      
      // Fetch user profile from user_profiles table
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')  // Let's select all fields to see what we get
        .eq('user_id', session.user.id)
        .single()
      
      console.log('Profile Data:', profileData) // Debug log
      console.log('Profile Error:', error)      // Debug log
      
      if (!error && profileData) {
        setProfile(profileData)
      } else {
        console.log('No profile found or error occurred')
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <Spinner />
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Welcome to your Dashboard, {profile?.first_name || 'Student'}
          </h1>
          
          <div className="mb-8">
            <TimeTable />
          </div>
          
          <div className="mt-12">
            <DegreeProgress />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
} 