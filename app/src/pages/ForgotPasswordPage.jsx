/**
 * Forgot Password Page
 * Password reset interface for authenticated users
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';

// Eye icon component for password visibility toggle
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-700 hover:cursor-pointer">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Eye slash icon component for password visibility toggle
const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 hover:text-gray-700 hover:cursor-pointer">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function ForgotPasswordPage() {
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password visibility toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Handle password reset form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.resetPassword(formData);
      setSuccess(response.data.message || 'Password updated successfully');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Password Reset</h1>
        <p className="text-center text-gray-600 mb-8">Change your password using your current credentials</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
              <div 
                className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
