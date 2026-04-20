import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, Home } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the global header on auth pages and the landing homepage
  const noHeaderPaths = ['/login', '/signup', '/forgot-password', '/'];
  
  if (noHeaderPaths.includes(location.pathname)) return null;

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 text-gray-800 p-3 shadow-sm sticky top-0 z-50 flex justify-between items-center transition-all">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-10 h-10 transition-colors"
          title="Go Back"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center justify-center hover:bg-gray-100 text-gray-600 rounded-full w-10 h-10 transition-colors hidden sm:flex"
          title="Dashboard"
        >
          <Home size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 text-xl tracking-tight cursor-pointer" onClick={() => navigate('/dashboard')}>
        PersonalGift
      </div>
      
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-full transition-all shadow-md shadow-indigo-200 font-medium"
          title="Profile"
        >
          <User size={18} />
          <span className="hidden sm:inline">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
