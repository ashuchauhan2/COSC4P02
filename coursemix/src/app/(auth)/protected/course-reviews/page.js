'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AcademicCapIcon } from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'

const CourseReviews = () => {
  // State to store the enrolled courses
  const [enrolledCourses, setEnrolledCourses] = useState([])
  // State to manage loading state
  const [loading, setLoading] = useState(true)
  // State to manage error messages
  const [error, setError] = useState(null)
  // State to store reviews
  const [reviews, setReviews] = useState({})
  // State to manage review text input for each course
  const [reviewText, setReviewText] = useState({})
  // State to manage rating input for each course
  const [rating, setRating] = useState({})

  // useEffect hook to fetch enrolled courses when the component mounts
  useEffect(() => {
    fetchEnrolledCourses()
  }, [])

  // Function to fetch enrolled courses from the database
  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true) // Set loading state to true while fetching data
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError // Throw error if there's an issue fetching the user

      // Fetch enrolled courses with course details
      const { data, error: coursesError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses:course_id (
            id,
            course_code,
            class_type,
            course_days,
            class_time,
            course_duration,
            instructor,
            start_date,
            end_date
          )
        `)
        .eq('user_id', user.id) // Filter by the current user's ID
        .eq('status', 'enrolled') // Filter by enrollment status

      if (coursesError) throw coursesError // Throw error if there's an issue fetching the courses

      setEnrolledCourses(data) // Set the enrolled courses state with the fetched data
    } catch (err) {
      console.error('Error fetching enrolled courses:', err)
      setError(err.message) // Set error state if there's an issue
    } finally {
      setLoading(false) // Set loading state to false after fetching data
    }
  }

  // Function to handle review submission
  const handleReviewSubmit = (courseId) => {
    if (!reviewText[courseId] || rating[courseId] === 0) return

    // Update the reviews state
    setReviews(prevReviews => ({
      ...prevReviews,
      [courseId]: [...(prevReviews[courseId] || []), { review_text: reviewText[courseId], rating: rating[courseId] }]
    }))

    // Clear the form
    setReviewText(prevReviewText => ({ ...prevReviewText, [courseId]: '' }))
    setRating(prevRating => ({ ...prevRating, [courseId]: 0 }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Course Reviews</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center p-6 text-gray-500">Loading...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You are not enrolled in any courses.
            </div>
          ) : (
            enrolledCourses.map(({ course_id, courses }) => (
              <div key={course_id} className="bg-white shadow-md p-4 rounded-lg mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <AcademicCapIcon className="h-6 w-6 text-teal-600" />
                  <h2 className="text-lg font-semibold">{courses.course_code}</h2>
                </div>
                <div className="mt-3">
                  <textarea
                    className="w-full border rounded-md p-2"
                    placeholder="Write a review..."
                    value={reviewText[course_id] || ''}
                    onChange={(e) => setReviewText({ ...reviewText, [course_id]: e.target.value })}
                  />
                  <div className="flex space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className={`h-6 w-6 ${rating[course_id] >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                        onClick={() => setRating({ ...rating, [course_id]: star })}
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleReviewSubmit(course_id)}
                    className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
                  >
                    Submit Review
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {(reviews[course_id] || []).map((review, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded-md">
                      <p className="text-gray-700">{review.review_text}</p>
                      <div className="flex items-center mt-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <StarIcon key={i} className="h-4 w-4 text-yellow-500" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseReviews
