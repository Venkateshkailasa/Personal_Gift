/**
 * Header Component
 * Global navigation header with back button, home button, and profile access
 * Conditionally renders based on current route and user role
 */

import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, Home } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  // Navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Get current user from auth context
  const { user } = useContext(AuthContext);

  // Routes where header should not be displayed
  const noHeaderPaths = ['/login', '/signup', '/forgot-password', '/'];

  // Hide header on auth pages, landing page, or for admin users
  if (noHeaderPaths.includes(location.pathname) || user?.role === 'admin') return null;

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 text-gray-800 p-3 shadow-sm sticky top-0 z-50 flex justify-between items-center transition-all duration-300">
      {/* Left side navigation buttons */}
      <div className="flex items-center gap-3">
        {/* Back button - navigates to previous page */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full w-10 h-10 transition-all btn-hover border border-gray-100"
          title="Go Back"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Home/Dashboard button - only visible on larger screens */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center hover:bg-gray-100 text-gray-600 rounded-full w-10 h-10 transition-all btn-hover hidden sm:flex"
          title="Dashboard"
        >
          <Home size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Center logo/title - clickable to navigate to dashboard */}
      <div
        className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-2xl tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate('/dashboard')}
      >
        PersonalGift
      </div>

      {/* Right side profile button */}
      <div className="flex gap-4 items-center">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center justify-center bg-white hover:border-indigo-300 text-gray-600 rounded-full w-12 h-12 transition-all btn-hover overflow-hidden border border-gray-200 shadow-sm premium-shadow-hover"
          title="Profile"
        >
          {/* Display profile image if available, otherwise show user icon */}
          {user?.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500">
              <User size={20} />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;
