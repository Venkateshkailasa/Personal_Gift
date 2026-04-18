import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the global header on auth pages and the landing homepage
  const noHeaderPaths = ['/login', '/signup', '/forgot-password', '/'];
  
  // Also hide for public wishlists that don't need logged-in navigation
  if (noHeaderPaths.includes(location.pathname) || location.pathname.startsWith('/wishlist/') && location.pathname.split('/').length === 3 && location.pathname.split('/')[2].length > 20) {
      if (noHeaderPaths.includes(location.pathname)) return null;
  }

  // To be safe, just hide on login/signup/forgot-password, Home
  if (noHeaderPaths.includes(location.pathname)) return null;

  return (
    <div className="bg-indigo-600 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
      >
        <span className="font-bold">←</span> Back
      </button>
      
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => navigate('/profile-setup')} 
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-700 px-3 py-1.5 rounded-full transition shadow-sm font-medium"
          title="Profile"
        >
          <span className="text-lg">👤</span> Profile
        </button>
      </div>
    </div>
  );
};

export default Header;
