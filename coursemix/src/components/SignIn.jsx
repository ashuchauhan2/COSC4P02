"use client"
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    const savedPassword = localStorage.getItem('rememberedPassword')
    if (savedEmail && savedPassword) {
      setEmail(savedEmail)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email)
        localStorage.setItem('rememberedPassword', password)
      } else {
        localStorage.removeItem('rememberedEmail')
        localStorage.removeItem('rememberedPassword')
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push('/dashboard')
      router.refresh()

    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-b from-[rgba(0,118,191,0.55)] via-[rgba(0,113,184,0.53)] to-[rgba(0,55,89,0.3)] rounded-lg shadow-2xl mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>
      
      <div aria-live="assertive">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
            <p className="font-bold">{error}</p> {/* Bold error text */}
          </div>
        )}
      </div>

      <form onSubmit={handleSignIn}>
        <div className="mb-4">
          <label className="block text-gray-200 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-200 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-200">Remember Me</label>
        </div>

        <Button
          type="submit"
          className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg "
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
