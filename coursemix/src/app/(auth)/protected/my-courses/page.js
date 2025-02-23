'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MyCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

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
        .eq('user_id', user.id)
        .eq('status', 'enrolled');

      if (coursesError) throw coursesError;

      setEnrolledCourses(data);
    } catch (err) {
      console.error('Error fetching enrolled courses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (enrollmentId, courseId) => {
    try {
      setLoading(true);
      
      // Delete the enrollment record
      const { error: dropError } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (dropError) throw dropError;

      // Update the local state
      setEnrolledCourses(prevCourses => 
        prevCourses.filter(course => course.id !== enrollmentId)
      );

    } catch (err) {
      console.error('Error dropping course:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {enrolledCourses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              You are not enrolled in any courses.
            </div>
          ) : (
            <>
              {/* Table for medium and large screens */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrolledCourses.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {enrollment.courses.course_code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.courses.class_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.courses.course_days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.courses.class_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.courses.course_duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enrollment.courses.instructor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDrop(enrollment.id, enrollment.course_id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Drop
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card layout for mobile screens */}
              <div className="md:hidden">
                {enrolledCourses.map((enrollment) => (
                  <div 
                    key={enrollment.id} 
                    className="border-b border-gray-200 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">
                        {enrollment.courses.course_code}
                      </span>
                      <button
                        onClick={() => handleDrop(enrollment.id, enrollment.course_id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Drop
                      </button>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex justify-between">
                        <span className="font-medium">Type:</span>
                        <span>{enrollment.courses.class_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Days:</span>
                        <span>{enrollment.courses.course_days}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Time:</span>
                        <span>{enrollment.courses.class_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Duration:</span>
                        <span>{enrollment.courses.course_duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Instructor:</span>
                        <span>{enrollment.courses.instructor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}