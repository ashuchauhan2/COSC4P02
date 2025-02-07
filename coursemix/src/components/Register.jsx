"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AnimatedBadger from '@/components/AnimatedBadger'

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeInput, setActiveInput] = useState(null)

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const isLongEnough = password.length >= 8

    if (!hasUpperCase) return "Password must contain at least one uppercase letter"
    if (!hasLowerCase) return "Password must contain at least one lowercase letter"
    if (!hasNumber) return "Password must contain at least one number"
    if (!isLongEnough) return "Password must be at least 8 characters long"
    return null
  }

  const validateEmail = (email) => {
    if (!email.toLowerCase().endsWith('@brocku.ca')) {
      return "Please use your Brock University email (@brocku.ca)"
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate email
      const emailError = validateEmail(formData.email)
      if (emailError) throw new Error(emailError)

      // Validate password
      const passwordError = validatePassword(formData.password)
      if (passwordError) throw new Error(passwordError)

      // Check passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords don't match")
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_verification')
        .select('email')
        .eq('email', formData.email)
        .single()

      if (existingUser) {
        throw new Error('An account with this email already exists')
      }

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Send verification code
      const res = await fetch('/api/verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code,
          password: formData.password // We'll store this temporarily
        })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed to send verification code')

      setShowVerification(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Verification failed')
      }

      // Redirect to sign in
      router.push('/signin')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">
          Create your account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {!showVerification 
            ? "Join Course Mix using your Brock University email"
            : "Enter the verification code sent to your email"
          }
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
          <AnimatedBadger 
            activeInput={activeInput} 
            inputValue={
              activeInput === 'email'
                ? formData.email
                : activeInput === 'password'
                ? formData.password
                : activeInput === 'confirmPassword'
                ? formData.confirmPassword
                : ''
            }
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm mb-6">
              {error}
            </div>
          )}

          {!showVerification ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Brock Email
                </label>
                <div className="mt-1">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onFocus={() => setActiveInput('email')}
                    onBlur={() => setActiveInput(null)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="firstname@brocku.ca"
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setActiveInput('password')}
                    onBlur={() => setActiveInput(null)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    onFocus={() => setActiveInput('confirmPassword')}
                    onBlur={() => setActiveInput(null)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerification} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <Input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Enter 6-digit code"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
