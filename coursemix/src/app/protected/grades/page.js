'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/Spinner';
import AddCourseModal from '@/components/AddCourseModal';
import DegreeProgress from '@/components/DegreeProgressBar';
import ProfileBadger from '@/components/ProfileBadger';

export default function Grades() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [programRequirements, setProgramRequirements] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Fetch user profile with program info
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          programs:program_id (*)
        `)
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch program requirements
      const { data: requirements, error: requirementsError } = await supabase
        .from('program_requirements')
        .select('*')
        .eq('program_id', profile.program_id)
        .order('year', { ascending: true });

      if (requirementsError) throw requirementsError;
      setProgramRequirements(requirements);

      // Fetch student grades
      const { data: grades, error: gradesError } = await supabase
        .from('student_grades')
        .select('*')
        .eq('user_id', user.id);

      if (gradesError) throw gradesError;
      setStudentGrades(grades);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (courseCode, year, grade) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('student_grades')
        .insert([
          {
            user_id: user.id,
            course_code: courseCode,
            grade: grade,
            year: year,
            status: grade ? 'completed' : 'in_progress'
          }
        ]);

      if (error) throw error;
      
      // Refresh the data
      fetchUserData();
      setShowAddCourseModal(false);
    } catch (err) {
      console.error('Error adding course:', err);
      setError(err.message);
    }
  };

  const getGradeForCourse = (courseCode) => {
    const gradeEntry = studentGrades.find(g => g.course_code === courseCode);
    return gradeEntry ? gradeEntry.grade : null;
  };

  const getStatusForCourse = (courseCode) => {
    const gradeEntry = studentGrades.find(g => g.course_code === courseCode);
    return gradeEntry ? gradeEntry.status : 'not_started';
  };

  const renderYearColumn = (year) => {
    const yearRequirements = programRequirements.filter(r => r.year === year);
    
    return (
      <div key={year} className="flex-1 min-w-[250px]">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Year {year}</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {yearRequirements.map((course) => {
                  const grade = getGradeForCourse(course.course_code);
                  const status = getStatusForCourse(course.course_code);
                  
                  return (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          {course.course_code}
                        </div>
                        <div className="text-xs text-gray-500">
                          {course.credit_weight} credits • {course.requirement_type}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm text-gray-900">
                          {grade || '-'}
                        </div>
                        <div className="mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'completed' ? 'bg-green-100 text-green-800' :
                            status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                        {status === 'not_started' && (
                          <button
                            onClick={() => {
                              setSelectedYear(year);
                              setShowAddCourseModal(true);
                            }}
                            className="mt-2 text-xs text-teal-600 hover:text-teal-900"
                          >
                            Add Grade
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[95%] mx-auto py-6">
        <div className="px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Academic Progress</h1>
            <button
              onClick={() => {
                setSelectedYear(null);
                setShowAddCourseModal(true);
              }}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Add New Credit
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}

          <div className="bg-gray-50 shadow overflow-hidden sm:rounded-lg p-6 pb-0 pt-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="w-full md:w-1/3">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Program Information</h2>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Program: {userProfile?.programs?.program_name || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Projected Graduation: Fall 2025
                  </p>
                  <p className="text-sm text-gray-500">
                    Average: 90%
                  </p>
                  <p className="text-sm text-gray-500">
                    Credits Achieved: 17
                  </p>
                </div>
              </div>
              <div className="hidden md:flex md:w-1/3 md:justify-center">
                <ProfileBadger />
              </div>
              <div className="w-full md:w-1/3">
                <DegreeProgress />
              </div>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6">
            {[1, 2, 3, 4].map(year => renderYearColumn(year))}
          </div>

          <AddCourseModal
            isOpen={showAddCourseModal}
            onClose={() => setShowAddCourseModal(false)}
            onSubmit={handleAddCourse}
            year={selectedYear}
          />
        </div>
      </div>
    </div>
  );
}