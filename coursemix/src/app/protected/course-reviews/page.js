'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import RequireAuth from '@/components/RequireAuth'
import { StarIcon } from '@heroicons/react/24/solid'
import { AcademicCapIcon } from '@heroicons/react/24/outline'

const CourseReviews = () => {
  const [courses, setCourses] = useState([
    {
      course_id: 1,
      course_name: 'Internet Technologies',
      course_code: 'COSC 2P89'
    },
    {
      course_id: 2,
      course_name: 'Introduction to Computer Science',
      course_code: 'COSC 1P02'
    }
  ])
  const [reviews, setReviews] = useState({
    1: [
      {
        review_text: 'Great course, very engaging and practical.',
        rating: 5
      },
      {
        review_text: 'Somewhat difficult but very rewarding.',
        rating: 4
      }
    ],
    2: [
      {
        review_text: 'Easy and informative, learned a lot.',
        rating: 5
      },
      {
        review_text: 'The course content was a bit dry.',
        rating: 3
      }
    ]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Simulate a delay for loading
    setLoading(false)
  }, [])

  const handleReviewSubmit = (courseId) => {
    if (!reviewText || rating === 0) return

    // Add a new review (here, we're just adding it to the state)
    setReviews((prevReviews) => {
      const newReview = { review_text: reviewText, rating }
      return {
        ...prevReviews,
        [courseId]: [...(prevReviews[courseId] || []), newReview]
      }
    })

    // Clear the form
    setReviewText('')
    setRating(0)
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
            ) : courses.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                You are not enrolled in any courses.
              </div>
            ) : (
              courses.map(({ course_id, course_name, course_code }) => (
                <div key={course_id} className="bg-white shadow-md p-4 rounded-lg mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-lg font-semibold">{course_name} ({course_code})</h2>
                  </div>

                  <div className="space-y-2">
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

                  <div className="mt-3">
                    <textarea
                      className="w-full border rounded-md p-2"
                      placeholder="Write a review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <div className="flex space-x-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`h-6 w-6 ${rating >= star ? 'text-yellow-500' : 'text-gray-400'}`}
                          onClick={() => setRating(star)}
                        >
                          <StarIcon className="h-5 w-5" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleReviewSubmit(course_id)}
                      className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Submit Review
                    </button>
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
