'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';  // Use the shared client instead
import Spinner from './Spinner';

export default function NewProfileSetup() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentNumber: '',
    programId: '',
    targetAverage: ''
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User check:', { user, error: userError });

        if (userError || !user) {
          console.log('No authenticated user found, redirecting to sign in');
          router.push('/signin');
          return;
        }

        // Fetch programs only if we have an authenticated user
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('id, program_name')
          .order('program_name');

        if (programsError) {
          console.error('Error fetching programs:', programsError);
          throw programsError;
        }

        setPrograms(programsData);
      } catch (error) {
        console.error('Error in session check:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        router.push('/signin');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Get current user and log the response
      const { data, error: userError } = await supabase.auth.getUser();
      console.log('Auth response:', { data, error: userError });

      if (userError) {
        throw new Error('Authentication error: ' + userError.message);
      }

      if (!data?.user) {
        throw new Error('No user found - Please try signing out and signing in again');
      }

      // Check if student number already exists
      const { data: existingStudent } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('student_number', formData.studentNumber)
        .single();

      if (existingStudent) {
        setError('Student number already exists');
        return;
      }

      // Insert new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            student_number: formData.studentNumber,
            program_id: parseInt(formData.programId),
            target_average: parseInt(formData.targetAverage),
            is_profile_setup: true
          }
        ]);

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        if (insertError.code === '23503') {  // Foreign key violation
          throw new Error('Invalid program selected. Please try again.');
        } else if (insertError.code === '23505') {  // Unique constraint violation
          throw new Error('A profile with this student number already exists.');
        }
        throw insertError;
      }

      console.log('Profile created successfully');

      // Redirect to dashboard
      router.push('/protected/dashboard');
      router.refresh();

    } catch (error) {
      console.error('Error submitting profile:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide your information to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6 bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 h-11 bg-gray-50 border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 h-11 bg-gray-50 border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700">Student Number</label>
              <input
                id="studentNumber"
                name="studentNumber"
                type="text"
                required
                pattern="[0-9]{7}"
                title="Student number must be exactly 7 digits"
                className="appearance-none rounded relative block w-full px-3 py-2 h-11 bg-gray-50 border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                value={formData.studentNumber}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="programId" className="block text-sm font-medium text-gray-700">Program</label>
              <select
                id="programId"
                name="programId"
                required
                className="mt-1 block w-full py-2 px-3 h-11 bg-gray-50 border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                value={formData.programId}
                onChange={handleChange}
              >
                <option value="">Select a program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.program_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="targetAverage" className="block text-sm font-medium text-gray-700">Target Average (%)</label>
              <input
                id="targetAverage"
                name="targetAverage"
                type="number"
                required
                min="0"
                max="100"
                className="appearance-none rounded relative block w-full px-3 py-2 h-11 bg-gray-50 border-gray-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                value={formData.targetAverage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
            >
              {submitting ? 'Saving...' : 'Complete Profile Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
