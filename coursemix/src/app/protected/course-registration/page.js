'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
import Spinner from '@/components/Spinner';
import debounce from 'lodash/debounce';
import React from 'react';
import ErrorPopup from '@/components/ErrorPopup';
import ConfirmDialog from '@/components/ConfirmDialog';

const CourseRegistrationPage = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', courseId: null });
  const pageSize = 20;

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

  // Popular course subjects for quick filtering
  const popularSubjects = [
    { code: 'COSC', name: 'Computer Science' },
    { code: 'MATH', name: 'Mathematics' },
    { code: 'PHYS', name: 'Physics' },
    { code: 'BIOL', name: 'Biology' },
    { code: 'CHEM', name: 'Chemistry' }
  ];

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id)
          .eq('status', 'enrolled');

        if (enrollmentsError) throw enrollmentsError;
        setEnrolledCourses(enrollments.map(e => e.course_id));
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
        setError(err.message);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Create a memoized debounced search function that gets cleaned up properly
  const debouncedSearch = React.useCallback(
    debounce(async (searchValue, duration, type, newPage = 0) => {
      // Clean up search value by keeping space only after first 4 characters
      const prefix = searchValue.slice(0, 4).replace(/\s+/g, '');
      const rest = searchValue.slice(4).replace(/\s+/g, '');
      const cleanSearchValue = `${prefix}${rest}`;

      // Only search if there's at least 4 characters (minimum course code length)
      if (!prefix || prefix.length < 4) {
        setCourses([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let query = supabase
          .from('courses')
          .select('*', { count: 'exact' })
          .ilike('course_code', `${prefix}%${rest}%`);

        if (duration) {
          query = query.eq('course_duration', duration);
        }
        if (type) {
          query = query.eq('class_type', type);
        }

        const from = newPage * pageSize;
        const to = from + pageSize - 1;
        
        const { data, count, error } = await query
          .order('course_code')
          .range(from, to);

        if (error) throw error;

        setCourses(prev => newPage === 0 ? data : [...prev, ...data]);
        setHasMore(count > (newPage + 1) * pageSize);
        setPage(newPage);
      } catch (err) {
        console.error('Error searching courses:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle search input change with loading state management
  const handleSearchChange = (value) => {
    // Allow mixed case input
    setSearchTerm(value.toUpperCase());
    setPage(0);
    setLoading(true);
    debouncedSearch(value.toUpperCase(), selectedDuration, selectedType, 0);
  };

  // Handle filter changes with loading state management
  const handleFilterChange = (duration, type) => {
    setSelectedDuration(duration);
    setSelectedType(type);
    setPage(0);
    setLoading(true); // Set loading immediately when filters change
    debouncedSearch(searchTerm, duration, type, 0);
  };

  // Load more with proper loading state check
  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      debouncedSearch(searchTerm, selectedDuration, selectedType, page + 1);
    }
  };

  // Quick filter by subject with loading state management
  const handleSubjectClick = (subjectCode) => {
    setSearchTerm(subjectCode);
    setPage(0);
    setLoading(true);
    debouncedSearch(subjectCode, selectedDuration, selectedType, 0);
  };

  // Function to check for time conflicts
  const checkTimeConflict = (course1, course2) => {
    console.log('Checking conflict between:', {
      course1: {
        code: course1.course_code,
        days: course1.course_days,
        time: course1.class_time
      },
      course2: {
        code: course2.course_code,
        days: course2.course_days,
        time: course2.class_time
      }
    });

    // Parse days into arrays, handling both single characters and space-separated days
    const getDays = (dayStr) => {
      // If the string is empty, return empty array
      if (!dayStr || dayStr.trim() === '') return [];
      // Split by space and filter out empty strings
      const days = dayStr.split(' ').filter(d => d.trim() !== '');
      console.log('Parsed days for', dayStr, ':', days);
      return days;
    };
    
    const days1 = getDays(course1.course_days);
    const days2 = getDays(course2.course_days);
    
    // Check if there are any common days
    const hasCommonDays = days1.some(day => days2.includes(day));
    console.log('Has common days:', hasCommonDays);
    if (!hasCommonDays) return false;

    // Parse times into minutes since midnight
    const parseTime = (timeStr) => {
      console.log('Parsing time:', timeStr);
      // Remove all spaces and any trailing/leading characters
      const cleanTimeStr = timeStr.replace(/\s+/g, '').trim();
      
      // Handle 3 or 4 digit time format (e.g., "800" or "1900")
      let hours, minutes;
      if (cleanTimeStr.length === 3) {
        hours = parseInt(cleanTimeStr.substring(0, 1), 10);
        minutes = parseInt(cleanTimeStr.substring(1), 10);
      } else if (cleanTimeStr.length === 4) {
        hours = parseInt(cleanTimeStr.substring(0, 2), 10);
        minutes = parseInt(cleanTimeStr.substring(2), 10);
      } else {
        throw new Error(`Invalid time format: ${timeStr}`);
      }

      const totalMinutes = hours * 60 + minutes;
      console.log('Converted to minutes:', totalMinutes);
      return totalMinutes;
    };

    try {
      // Parse time ranges, handling potential format issues
      const times1 = course1.class_time.split('-').map(t => t.trim());
      const times2 = course2.class_time.split('-').map(t => t.trim());

      const start1 = parseTime(times1[0]);
      const end1 = parseTime(times1[1]);
      const start2 = parseTime(times2[0]);
      const end2 = parseTime(times2[1]);

      console.log('Time ranges in minutes:', {
        course1: { start: start1, end: end1 },
        course2: { start: start2, end: end2 }
      });

      // Check for time overlap
      const hasOverlap = (start1 < end2 && start2 < end1);
      console.log('Has time overlap:', hasOverlap);
      return hasOverlap;
    } catch (err) {
      console.error('Error parsing times:', err);
      // If there's an error parsing times, we should assume there might be a conflict
      // to be on the safe side
      setError('Error checking time conflict. Please verify the course times manually.');
      return true;
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Get course details
      const courseToEnroll = courses.find(c => c.id === courseId);
      if (!courseToEnroll) {
        throw new Error('Course not found');
      }

      console.log('Attempting to enroll in course:', {
        code: courseToEnroll.course_code,
        days: courseToEnroll.course_days,
        time: courseToEnroll.class_time
      });

      // Check if the course is currently available
      const currentDate = new Date();
      const startDate = new Date(courseToEnroll.start_date);
      const endDate = new Date(courseToEnroll.end_date);

      if (currentDate > endDate) {
        throw new Error('This course has already ended');
      }

      // Get enrolled courses details for time conflict checking
      const { data: enrolledCoursesData, error: enrolledCoursesError } = await supabase
        .from('courses')
        .select('*')
        .in('id', enrolledCourses);

      if (enrolledCoursesError) throw enrolledCoursesError;

      console.log('Currently enrolled courses:', enrolledCoursesData.map(c => ({
        code: c.course_code,
        days: c.course_days,
        time: c.class_time
      })));

      // Check for time conflicts
      const conflictingCourse = enrolledCoursesData.find(enrolledCourse => 
        checkTimeConflict(enrolledCourse, courseToEnroll)
      );

      if (conflictingCourse) {
        console.log('Found conflicting course:', {
          code: conflictingCourse.course_code,
          days: conflictingCourse.course_days,
          time: conflictingCourse.class_time
        });
        // Show confirmation dialog
        setConfirmDialog({
          show: true,
          message: `This course conflicts with ${conflictingCourse.course_code} (${conflictingCourse.course_days} ${conflictingCourse.class_time}). Do you still want to enroll?`,
          courseId,
          isConflict: true
        });
        return;
      }

      console.log('No conflicts found, proceeding with enrollment');
      // If no conflicts, proceed with enrollment
      await processEnrollment(courseId);

    } catch (err) {
      console.error('Error enrolling in course:', err);
      setError(err.message);
    }
  };

  const processEnrollment = async (courseId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const courseToEnroll = courses.find(c => c.id === courseId);

      // Determine term based on start and end dates
      const startDate = new Date(courseToEnroll.start_date);
      const endDate = new Date(courseToEnroll.end_date);
      const startMonth = startDate.getMonth() + 1;
      const endMonth = endDate.getMonth() + 1;
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      let term;
      if (startMonth === 9 && endMonth === 12) {
        term = 'Fall';
      } else if (startMonth === 1 && endMonth === 4) {
        term = 'Winter';
      } else if (startMonth === 9 && endMonth === 4 && endYear > startYear) {
        term = 'Full Year';
      } else {
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
      setConfirmDialog({ show: false, message: '', courseId: null });
    } catch (err) {
      console.error('Error processing enrollment:', err);
      setError(err.message);
    }
  };

  const handleDrop = async (courseId) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Find the enrollment record for this course
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('status', 'enrolled')
        .single();

      if (enrollmentError) throw enrollmentError;
      if (!enrollmentData) throw new Error('Enrollment not found');

      // Delete the enrollment record
      const { error: dropError } = await supabase
        .from('enrollments')
        .delete()
        .eq('id', enrollmentData.id);

      if (dropError) throw dropError;

      // Update local state to remove the course from enrolled courses
      setEnrolledCourses(prevCourses => 
        prevCourses.filter(id => id !== courseId)
      );
    } catch (err) {
      console.error('Error dropping course:', err);
      setError(err.message);
    }
  };

  // Add error clearing function
  const clearError = () => {
    setError(null);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-8 px-2">Course Registration</h1>

          {/* Remove the old error display and add ErrorPopup */}
          <ErrorPopup error={error} onClose={clearError} />

          {confirmDialog.show && (
            <ConfirmDialog
              message={confirmDialog.message}
              onConfirm={() => processEnrollment(confirmDialog.courseId)}
              onCancel={() => setConfirmDialog({ show: false, message: '', courseId: null })}
            />
          )}

          <div className="bg-white rounded-lg shadow p-3 sm:p-6 mb-8 mx-2">
            {/* Quick subject filters */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Popular Subjects</h2>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {popularSubjects.map(subject => (
                  <button
                    key={subject.code}
                    onClick={() => handleSubjectClick(subject.code)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      searchTerm === subject.code
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {subject.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <input
                type="text"
                placeholder="Enter course code (e.g., COSC101)"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
              
              <select
                value={selectedDuration}
                onChange={(e) => handleFilterChange(e.target.value, selectedType)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
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
                onChange={(e) => handleFilterChange(selectedDuration, e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-sm"
              >
                <option value="">All Types</option>
                {classTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Course list */}
            <div className="-mx-3 sm:mx-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : !searchTerm || searchTerm.length < 4 ? (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  Enter a course code to search for available courses.
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  No courses found matching "{searchTerm}".
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Code
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses.map((course) => (
                        <tr key={course.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-2 sm:py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.course_code}
                            </div>
                            {/* Mobile-only details */}
                            <div className="sm:hidden mt-1 space-y-1">
                              <div className="text-xs text-gray-500">
                                {course.class_type} • {course.course_days} • {course.class_time}
                              </div>
                              <div className="text-xs text-gray-500">
                                {course.instructor}
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.class_type}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.course_days}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.class_time}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.course_duration}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.instructor}
                          </td>
                          <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm">
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
              )}

              {/* Load more button */}
              {hasMore && (
                <div className="mt-4 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
};

export default CourseRegistrationPage;