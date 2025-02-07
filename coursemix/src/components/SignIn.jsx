"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AnimatedBadger from '@/components/AnimatedBadger'
import Spinner from '@/components/Spinner'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeInput, setActiveInput] = useState(null)

  useEffect(() => {
    // Load stored credentials if "Remember Me" was checked
    const storedEmail = localStorage.getItem('rememberedEmail')
    const storedPassword = localStorage.getItem('rememberedPassword')
    const storedRememberMe = localStorage.getItem('rememberMe') === 'true'

    if (storedRememberMe && storedEmail && storedPassword) {
      setEmail(storedEmail)
      setPassword(storedPassword)
      setRememberMe(true)
    }
  }, [])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
        localStorage.setItem('rememberedPassword', password)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
        localStorage.removeItem('rememberMe')
      }

      // Redirect to dashboard
      router.push('/protected/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Sign in error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">
          Welcome back
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Sign in to continue to Course Mix
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
          <AnimatedBadger 
            activeInput={activeInput} 
            inputValue={activeInput === 'email' ? email : activeInput === 'password' ? password : ''} 
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm mb-6">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput(null)}
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-teal-600 hover:text-teal-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/register">
                <Button variant="outline" className="w-full h-11 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors">
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
