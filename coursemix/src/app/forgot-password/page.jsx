"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AnimatedBadger from '@/components/AnimatedBadger'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)
  const [error, setError] = useState(null)
  const [activeInput, setActiveInput] = useState(null)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store the code in Supabase with an expiration time (1 hour)
      const { error: storeError } = await supabase
        .from('reset_codes')
        .insert([
          {
            email,
            code,
            expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            used: false
          }
        ])

      if (storeError) throw storeError

      // Send email with the code using Resend
      const res = await fetch('/api/reset-password-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, code })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      setCodeSent(true)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match")
      setLoading(false)
      return
    }

    try {
      // Verify the code
      const { data: codes, error: fetchError } = await supabase
        .from('reset_codes')
        .select('*')
        .eq('email', email)
        .eq('code', verificationCode)
        .eq('used', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (fetchError) throw fetchError
      if (!codes) throw new Error('Invalid or expired code')

      // Update password
      const res = await fetch('/api/reset-password-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email, // Send email instead of user ID
          password: newPassword
        })
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password')
      }

      // Mark code as used
      const { error: markUsedError } = await supabase
        .from('reset_codes')
        .update({ used: true })
        .eq('id', codes.id)

      if (markUsedError) throw markUsedError

      // Redirect to sign in
      router.push('/signin')
    } catch (error) {
      console.error('Reset error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">
          Reset your password
        </h2>
        <p className="text-center text-gray-600 mb-8">
          {!codeSent 
            ? "Enter your email address and we'll send you a code to reset your password"
            : "Enter the verification code sent to your email"
          }
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
          <AnimatedBadger 
            activeInput={activeInput} 
            inputValue={email}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm mb-6">
              {error}
            </div>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-6">
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
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

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Remember your password?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  Back to sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 