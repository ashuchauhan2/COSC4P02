import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'email') {
      setIsValidEmail(value === '' || value.endsWith('@brocku.ca'));
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumbers = /\d/;
    const hasLetters = /[a-zA-Z]/;
    return password.length >= minLength && hasNumbers.test(password) && hasLetters.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (!formData.email.endsWith('@brocku.ca')) {
      setError('Only @brocku.ca email addresses are allowed');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Password must be at least 8 characters long and include both letters and numbers');
      setLoading(false);
      return;
    }

    try {
      const response = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      console.log("Sign-up response:", JSON.stringify(response, null, 2));

      if (response.error) {
        setError(response.error.message);
        setSuccess(false);
      } else if (response.data && response.data.user) {
        console.log("Identities array:", JSON.stringify(response.data.user.identities, null, 2));

        if (response.data.user.identities && response.data.user.identities.length > 0) {
          setSuccess(true);
          setFormData({ email: '', password: '', confirmPassword: '' });
        } else {
          setError('This email is already registered.');
          setSuccess(false);
        }
      }
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-2">
          Create your account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join Course Mix to start planning your academic journey
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 text-sm mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-md p-3 text-sm mb-6">
              A verification link has been sent to your email address.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="youremail@brocku.ca"
                />
                {!isValidEmail && formData.email && (
                  <p className="mt-1 text-sm text-red-600">Must be a @brocku.ca email address</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Create a strong password"
                />
                {formData.password && !validatePassword(formData.password) && (
                  <p className="mt-1 text-sm text-red-600">
                    Password must be at least 8 characters long and include letters and numbers
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 bg-gray-50 border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white transition-colors"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="w-full h-11 border-gray-200 hover:border-teal-500 hover:text-teal-600 transition-colors"
                >
                  Sign in instead
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
