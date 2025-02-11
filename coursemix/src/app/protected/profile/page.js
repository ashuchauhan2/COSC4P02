'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RequireAuth from '@/components/RequireAuth';
import Spinner from '@/components/Spinner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [programs, setPrograms] = useState([]);
  
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    student_number: '',
    program_id: '',
    target_average: '',
    email: ''
  });

  const [editedProfile, setEditedProfile] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          router.push('/signin');
          return;
        }

        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('id, program_name')
          .order('program_name');

        if (programsError) throw programsError;
        setPrograms(programsData);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*, programs(program_name)')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            router.push('/protected/profile-setup');
            return;
          }
          throw profileError;
        }

        setProfile({
          ...profileData,
          email: user.email
        });
        setEditedProfile({
          ...profileData,
          email: user.email
        });

      } catch (error) {
        console.error('Error loading profile:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleEdit = () => {
    setIsEditing(true);
    setSuccess(false);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
  
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
  
      console.log('Attempting to update profile for user:', user.id);
      console.log('Update payload:', {
        first_name: editedProfile.first_name,
        last_name: editedProfile.last_name,
        student_number: editedProfile.student_number,
        program_id: editedProfile.program_id ? parseInt(editedProfile.program_id) : null,
        target_average: editedProfile.target_average ? parseInt(editedProfile.target_average) : null
      });
  
      // Check if student number already exists (only if changed)
      if (editedProfile.student_number !== profile.student_number) {
        const { data: existingStudent, error: studentCheckError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('student_number', editedProfile.student_number)
          .neq('user_id', user.id)
          .maybeSingle();
  
        if (studentCheckError) {
          console.error('Error checking student number:', studentCheckError);
          throw studentCheckError;
        }
  
        if (existingStudent) {
          throw new Error('Student number already exists');
        }
      }
  
      // Update profile in Supabase
      const { data: updateData, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          first_name: editedProfile.first_name,
          last_name: editedProfile.last_name,
          student_number: editedProfile.student_number,
          program_id: editedProfile.program_id ? parseInt(editedProfile.program_id) : null,
          target_average: editedProfile.target_average ? parseInt(editedProfile.target_average) : null
        })
        .eq('user_id', user.id);
  
      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('Profile updated successfully:', updateData);
  
      setProfile({ ...editedProfile }); // Update local state
      setIsEditing(false);
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };
  

  if (loading) return <Spinner />;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardHeader className="border-b border-gray-200 pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Profile Information</CardTitle>
              <CardDescription className="text-lg text-gray-600">View and manage your profile details</CardDescription>
            </CardHeader>

            <CardContent className="px-6 py-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-6 py-4 rounded-md">
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="space-y-4">
                    <label htmlFor="first_name" className="block text-base font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={isEditing ? editedProfile.first_name : profile.first_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 text-base py-2.5"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={isEditing ? editedProfile.last_name : profile.last_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 text-base py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="email" className="block text-base font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-500 text-base py-2.5"
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="student_number" className="block text-base font-medium text-gray-700">
                      Student Number
                    </label>
                    <input
                      type="text"
                      id="student_number"
                      name="student_number"
                      value={isEditing ? editedProfile.student_number : profile.student_number}
                      onChange={handleChange}
                      disabled={!isEditing}
                      pattern="[0-9]{7}"
                      title="Student number must be exactly 7 digits"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 text-base py-2.5"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="program_id" className="block text-base font-medium text-gray-700">
                      Program
                    </label>
                    <select
                      id="program_id"
                      name="program_id"
                      value={isEditing ? editedProfile.program_id : profile.program_id}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 text-base py-2.5"
                      required
                    >
                      <option value="">Select a program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.program_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="target_average" className="block text-base font-medium text-gray-700">
                      Target Average (%)
                    </label>
                    <input
                      type="number"
                      id="target_average"
                      name="target_average"
                      value={isEditing ? editedProfile.target_average : profile.target_average}
                      onChange={handleChange}
                      disabled={!isEditing}
                      min="0"
                      max="100"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 text-base py-2.5"
                      required
                    />
                  </div>
                </div>
              </form>
            </CardContent>

            <CardFooter className="border-t border-gray-200 px-6 py-6">
              <div className="flex justify-end space-x-4">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="px-6 py-2.5 text-base font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-6 py-2.5 text-base font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}