'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
import Spinner from '@/components/Spinner';

const CourseRegistrationPage = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Duration options based on the provided information
  const durations = [
    { value: 'D1', label: 'Duration 1 (September to April)' },
    { value: 'D2', label: 'Duration 2 (September to December)' },
    { value: 'D3', label: 'Duration 3 (January to April)' }
  ];

  // Common class types
  const classTypes = [
    { value: 'LEC', label: 'Lecture' },
    { value: 'SEM', label: 'Seminar' },
    { value: 'PRO', label: 'Project' },
    { value: 'LAB', label: 'Laboratory' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Fetch all available courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('course_code');

        if (coursesError) throw coursesError;

        // Fetch user's enrolled courses
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id, status')
          .eq('user_id', user.id)
          .eq('status', 'enrolled');

        if (enrollmentsError) throw enrollmentsError;

        setCourses(coursesData);
        setEnrolledCourses(enrollments.map(e => e.course_id));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get course details
      const course = courses.find(c => c.id === courseId);
      
      // Check if the course is currently available
      const currentDate = new Date();
      const startDate = new Date(course.start_date);
      const endDate = new Date(course.end_date);

      if (currentDate > endDate) {
        throw new Error('This course has already ended');
      }

      // Determine term based on start and end dates
      let term;
      const startMonth = startDate.getMonth() + 1; // getMonth() returns 0-11
      const endMonth = endDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      if (startMonth === 9 && endMonth === 12) {
        term = 'Fall';
      } else if (startMonth === 1 && endMonth === 4) {
        term = 'Winter';
      } else if (startMonth === 9 && endMonth === 4 && endYear > startYear) {
        term = 'Full Year';
      } else {
        // Fallback for any other date combinations
        term = `${startYear}-${endYear}`;
      }

      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([
          {
            user_id: user.id,
            course_id: courseId,
            term,
            status: 'enrolled'
          }
        ]);

      if (enrollError) throw enrollError;

      setEnrolledCourses([...enrolledCourses, courseId]);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(err.message);
    }
  };

  const handleDrop = async (courseId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Delete the enrollment record instead of updating status
      const { error: dropError } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (dropError) throw dropError;

      setEnrolledCourses(enrolledCourses.filter(id => id !== courseId));
    } catch (err) {
      console.error('Error dropping course:', err);
      setError(err.message);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDuration = !selectedDuration || course.course_duration === selectedDuration;
    const matchesType = !selectedType || course.class_type === selectedType;
    return matchesSearch && matchesDuration && matchesType;
  });

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Course Registration</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
              
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Durations</option>
                {durations.map(duration => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Types</option>
                {classTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
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
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.course_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.class_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.course_days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.class_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.course_duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.instructor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {enrolledCourses.includes(course.id) ? (
                          <button
                            onClick={() => handleDrop(course.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Drop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="text-teal-600 hover:text-teal-800 font-medium"
                          >
                            Enroll
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default CourseRegistrationPage;