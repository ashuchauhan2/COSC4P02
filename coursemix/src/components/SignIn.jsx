"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

/**
 * AnimatedBadger component:
 * - When the password field is active, the badger’s eyes are closed.
 * - Otherwise, the eyes smoothly move based on the input value, with a subtle blinking effect.
 * - The head also gently rotates to mimic natural micro-adjustments while reading.
 */
const AnimatedBadger = ({ activeInput, inputValue }) => {
  const [eyeOffset, setEyeOffset] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkInterval, setBlinkInterval] = useState(null);
  const [headRotation, setHeadRotation] = useState(0);

  // Update eye position based on the input value only if not in password mode.
  useEffect(() => {
    if (activeInput && activeInput !== 'password' && inputValue) {
      const position = inputValue.length / 30; // Normalize the text length
      const newEyeOffset = Math.min(Math.max((position - 0.5) * 16, -8), 8);
      setEyeOffset(newEyeOffset);
    } else {
      setEyeOffset(0);
    }
  }, [activeInput, inputValue]);

  // Trigger a random blink every 2-6 seconds (skip blinking when password field is active).
  useEffect(() => {
    if (activeInput === 'password') return; // Keep eyes closed in password mode

    const startBlinking = () => {
      const interval = setInterval(() => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }, Math.random() * 4000 + 2000);
      setBlinkInterval(interval);
    };

    startBlinking();
    return () => clearInterval(blinkInterval);
  }, [activeInput]);

  // Add subtle head rotations to mimic natural micro-movements.
  useEffect(() => {
    if (activeInput) {
      const headRotationInterval = setInterval(() => {
        // Rotate between -3 and 3 degrees.
        const newRotation = (Math.random() - 0.5) * 6;
        setHeadRotation(newRotation);
      }, 2500);
      return () => clearInterval(headRotationInterval);
    } else {
      setHeadRotation(0);
    }
  }, [activeInput]);

  return (
    <div className="w-32 h-32 mx-auto mb-8 relative">
      {/* Container that applies head rotation */}
      <div 
        className="w-full h-full relative transform transition-transform duration-500"
        style={{ transform: `rotate(${headRotation}deg)` }}
      >
        {/* Main head with a radial gradient */}
        <div 
          className="absolute inset-0 rounded-full shadow-lg"
          style={{ background: 'radial-gradient(circle at 30% 30%, #555, #222)' }}
        >
          {/* White facial stripe */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-full bg-white rounded-full opacity-90" />

          {/* Black stripes */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-24 bg-black rounded" />
          <div className="absolute top-2 left-1/2 transform -translate-x-[calc(50%+6px)] w-2 h-20 bg-black rounded" />
          <div className="absolute top-2 left-1/2 transform -translate-x-[calc(50%-6px)] w-2 h-20 bg-black rounded" />

          {/* Ears with gradients */}
          <div 
            className="absolute -top-1 -left-1 w-8 h-8 rounded-full shadow-md"
            style={{ background: 'radial-gradient(circle at 30% 30%, #333, #000)' }}
          />
          <div 
            className="absolute -top-1 -right-1 w-8 h-8 rounded-full shadow-md"
            style={{ background: 'radial-gradient(circle at 70% 30%, #333, #000)' }}
          />

          {/* Eyes: Render closed eyes if password is active; otherwise render open eyes */}
          { activeInput === 'password' ? (
            <>
              {/* Closed eyes represented by horizontal lines */}
              <div className="absolute top-[42%] left-1/4 w-4 h-1 bg-black rounded-full" />
              <div className="absolute top-[42%] right-1/4 w-4 h-1 bg-black rounded-full" />
            </>
          ) : (
            <>
              {/* Open eyes with smooth transitions and blinking */}
              <div 
                className="absolute top-[40%] left-1/4 w-4 h-[16px] bg-white rounded-full overflow-hidden shadow-inner"
                style={{ transform: `translateX(${eyeOffset}px)` }}
              >
                <div 
                  className={`w-2.5 h-2.5 bg-black rounded-full relative top-1 left-0.5 transition-all duration-300 ${isBlinking ? 'transform translate-y-4' : ''}`}
                />
              </div>
              <div 
                className="absolute top-[40%] right-1/4 w-4 h-[16px] bg-white rounded-full overflow-hidden shadow-inner"
                style={{ transform: `translateX(${eyeOffset}px)` }}
              >
                <div 
                  className={`w-2.5 h-2.5 bg-black rounded-full relative top-1 left-0.5 transition-all duration-300 ${isBlinking ? 'transform translate-y-4' : ''}`}
                />
              </div>
            </>
          )}

          {/* Snout and Nose */}
          <div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-8 rounded-full"
            style={{ background: 'linear-gradient(145deg, #222, #000)' }}
          />
          <div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-5 h-3 bg-gray-800 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeInput, setActiveInput] = useState(null)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
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
            inputValue={
              activeInput === 'email'
                ? email
                : activeInput === 'password'
                ? password
                : ''
            } 
          />

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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
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
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  Create an account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}