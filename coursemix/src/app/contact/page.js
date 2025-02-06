"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    error: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ submitted: false, submitting: true, error: null })

    try {
      const res = await fetch('/api/send-contact-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Error sending message')
      }

      setStatus({ submitted: true, submitting: false, error: null })
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setStatus({
        submitted: false,
        submitting: false,
        error: error.message
      })
    }
  }

  return (
    <main className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Contact Us</h1>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {status.submitted ? (
              <div className="text-center py-8">
                <div className="text-teal-600 text-xl mb-4">Thank you for your message!</div>
                <p className="text-gray-600">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status.error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm">
                    {status.error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full rounded-md border-gray-200 bg-gray-50 focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status.submitting}
                  className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  {status.submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Other Ways to Reach Us</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-teal-600">Email</h3>
                <p className="text-gray-600">coursemixtroubleshoot@gmail.com</p>
              </div>
              <div>
                <h3 className="font-medium text-teal-600">Location</h3>
                <p className="text-gray-600">1812 Sir Isaac Brock Way, St. Catharines, ON L2S 3A1</p>
              </div>
              <div>
                <h3 className="font-medium text-teal-600">Hours</h3>
                <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM EST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 