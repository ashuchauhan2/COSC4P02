'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
import Spinner from '@/components/Spinner';

// Add these helper functions at the top of the file, after imports
const parseTimeString = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const checkTimeOverlap = (course1, course2) => {
  // Split days into arrays (e.g., "MWF" -> ["M", "W", "F"])
  const days1 = course1.course_days.split('');
  const days2 = course2.course_days.split('');

  // Check if there are any common days
  const commonDays = days1.some(day => days2.includes(day));
  if (!commonDays) return false;

  // Parse time ranges
  const [start1, end1] = course1.class_time.split(' - ').map(parseTimeString);
  const [start2, end2] = course2.class_time.split(' - ').map(parseTimeString);

  // Check for time overlap
  return !(end1 <= start2 || end2 <= start1);
};

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
    { value: '1', label: 'Duration 1 (September to April)' },
    { value: '2', label: 'Duration 2 (September to December)' },
    { value: '3', label: 'Duration 3 (January to April)' }
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

        // After fetching enrollments, get the full course details for enrolled courses
        if (enrollments.length > 0) {
          const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', enrollments.map(e => e.course_id));

          if (enrolledCoursesError) throw enrolledCoursesError;

          // Check for overlaps with existing courses
          const overlaps = {};
          coursesData.forEach(course => {
            const hasOverlap = enrolledCoursesData.some(enrolledCourse => 
              course.id !== enrolledCourse.id && checkTimeOverlap(course, enrolledCourse)
            );
            if (hasOverlap) {
              overlaps[course.id] = true;
            }
          });
        }

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
      const courseToEnroll = courses.find(c => c.id === courseId);
      
      // Get full details of currently enrolled courses
      const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', enrolledCourses);

      if (enrolledCoursesError) throw enrolledCoursesError;

      // Check for time conflicts
      const hasConflict = enrolledCoursesData.some(enrolledCourse => 
        checkTimeOverlap(courseToEnroll, enrolledCourse)
      );

      if (hasConflict) {
        setError('Cannot enroll: This course overlaps with one of your existing courses.');
        return;
      }

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
    // Split the search into prefix (first 4 chars) and rest
    const searchPrefix = searchTerm.slice(0, 4).toLowerCase();
    const searchRest = searchTerm.slice(4).toLowerCase().replace(/\s+/g, '');
    
    // Split course code into prefix and rest
    const coursePrefix = course.course_code.slice(0, 4).toLowerCase();
    const courseRest = course.course_code.slice(4).toLowerCase().replace(/\s+/g, '');
    
    // Match prefix exactly and rest flexibly
    const matchesSearch = coursePrefix.startsWith(searchPrefix) && 
      (searchRest === '' || courseRest.includes(searchRest));
      
    const matchesDuration = !selectedDuration || course.course_duration === parseInt(selectedDuration);
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
                    <tr 
                      key={course.id} 
                    >
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