"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import RequireAuth from '@/components/RequireAuth'
import TimeTable from '@/components/TimeTable'
import DegreeProgress from '@/components/DegreeProgressBar'
import Spinner from '@/components/Spinner'
import Image from 'next/image'
import { UserCircleIcon, AcademicCapIcon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { differenceInDays, parseISO, isWithinInterval } from 'date-fns'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [termDates, setTermDates] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/signin')
          return
        }
        setUser(session.user)
        
        // Fetch user profile from user_profiles table
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select(`
            *,
            programs:program_id (
              program_name
            )
          `)
          .eq('user_id', session.user.id)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') { // Record not found
            router.push('/protected/profile-setup')
            return
          }
          throw error
        }

        if (!profileData || profileData.is_profile_setup !== true) {
          router.push('/protected/profile-setup')
          return
        }

        setProfile(profileData)
        
        // Fetch avatar URL if it exists
        if (profileData?.avatar_url) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(profileData.avatar_url)
          setAvatarUrl(publicUrl)
        }
        
        // Fetch current term dates
        const currentDate = new Date()
        const { data: allTerms, error: termsError } = await supabase
          .from('important_dates')
          .select('*')
          .eq('year', currentDate.getFullYear())
          .order('term_start', { ascending: true })

        if (!termsError && allTerms) {
          // Find the current term by checking if current date falls between term_start and term_end
          const currentTerm = allTerms.find(term => 
            isWithinInterval(currentDate, {
              start: parseISO(term.term_start),
              end: parseISO(term.term_end)
            })
          )
          
          if (currentTerm) {
            setTermDates(currentTerm)
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error in dashboard auth check:', error)
        router.push('/signin')
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <Spinner />
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        <div className="w-full lg:w-64 bg-white shadow-lg">
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            <div className="flex lg:flex-col items-center space-x-4 lg:space-x-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={64}
                  height={64}
                  className="rounded-full lg:w-24 lg:h-24"
                />
              ) : (
                <UserCircleIcon className="h-16 w-16 lg:h-24 lg:w-24 text-gray-400" />
              )}
              <h2 className="mt-0 lg:mt-4 font-semibold text-lg">
                {profile?.first_name} {profile?.last_name}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:space-y-4">
              <div className="flex items-center space-x-3">
                <AcademicCapIcon className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Program</p>
                  <p className="font-medium">
                    {profile?.programs?.program_name || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ChartBarIcon className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Current Average</p>
                  <p className="font-medium">{profile?.current_average || 'N/A'}%</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Credits Completed</p>
                  <p className="font-medium">{profile?.credits_completed || '0'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 lg:pt-6 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Courses This Term</p>
                  <p className="text-lg font-semibold">{profile?.current_courses_count || '0'}</p>
                </div>
                
                {termDates && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Current Term</p>
                      <p className="text-lg font-semibold">
                        {termDates.term_type} {termDates.year}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">Term Progress</p>
                      <div className="mt-1 h-2 w-full bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-indigo-600 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, Math.max(0, 
                              (differenceInDays(new Date(), parseISO(termDates.term_start)) / 
                               differenceInDays(parseISO(termDates.term_end), parseISO(termDates.term_start))) * 100
                            ))}%` 
                          }}
                        />
                      </div>
                      <p className="text-sm mt-1 text-gray-600">
                        {differenceInDays(parseISO(termDates.term_end), new Date()) + 1} days remaining
                      </p>
                    </div>

                    {termDates.reading_week_start && termDates.reading_week_end && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Reading Week</p>
                        {isWithinInterval(new Date(), {
                          start: parseISO(termDates.reading_week_start),
                          end: parseISO(termDates.reading_week_end)
                        }) ? (
                          <>
                            <p className="text-lg font-semibold text-green-600">Currently Active</p>
                            <p className="text-sm text-gray-600">
                              Ends in {differenceInDays(parseISO(termDates.reading_week_end), new Date()) + 1} days
                            </p>
                          </>
                        ) : (
                          parseISO(termDates.reading_week_start) > new Date() ? (
                            <>
                              <p className="text-lg font-semibold">
                                Starts in {differenceInDays(parseISO(termDates.reading_week_start), new Date()) + 1} days
                              </p>
                              <p className="text-sm text-gray-600">
                                {dayjs(termDates.reading_week_start).tz("America/Toronto").format('YYYY-MM-DD')} - {dayjs(termDates.reading_week_end).tz("America/Toronto").format('YYYY-MM-DD')}
                              </p>
                            </>
                          ) : (
                            <p className="text-lg font-semibold text-gray-500">Completed</p>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="py-4 lg:py-8 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">
                Welcome back, {profile?.first_name || 'Student'}
              </h1>
              
              <div className="mb-6 lg:mb-8 overflow-x-auto">
                <TimeTable />
              </div>
              
              <div className="mt-8 lg:mt-12">
                <DegreeProgress />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  )
} 