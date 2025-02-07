'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Spinner from './Spinner';

export default function NewProfileSetup() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
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
    const fetchPrograms = async () => {
      try {
        const { data: programsData, error } = await supabase
          .from('programs')
          .select('id, program_name')
          .order('program_name');

        if (error) throw error;
        setPrograms(programsData);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [supabase]);

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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

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
            user_id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            student_number: formData.studentNumber,
            program_id: formData.programId,
            target_average: parseInt(formData.targetAverage),
            is_profile_setup: true
          }
        ]);

      if (insertError) throw insertError;

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

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please provide your information to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.targetAverage}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {submitting ? 'Saving...' : 'Complete Profile Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
