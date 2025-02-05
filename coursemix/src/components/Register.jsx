import { useState } from 'react';
import { supabase } from '../supabaseClient';

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
    <div className="max-w-md mx-auto mt-10 p-6 bg-gradient-to-b from-[rgba(0,118,191,0.55)] via-[rgba(0,113,184,0.53)] to-[rgba(0,55,89,0.3)] rounded-lg shadow-2xl mb-8">
      <h2 className="text-3xl font-bold text-white text-center mb-6">Create an Account</h2>
      
      <div aria-live="assertive">
        {error && (
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded mb-4">
            A verification link has been sent to your email address.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="youremail@brocku.ca"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500
              ${!isValidEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            required
          />
          {!isValidEmail && formData.email && (
            <p className="text-red-500 text-xs mt-1">Must be a @brocku.ca email address</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
          {formData.password && !validatePassword(formData.password) && (
            <p className="text-red-500 text-xs mt-1 font-bold">Password must be at least 8 characters long and include letters and numbers</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-lg 
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <span className="spinner-border animate-spin">Registering...</span>
          ) : (
            'Register'
          )}
        </button>
      </form>
    </div>
  );
}

export default Register;
