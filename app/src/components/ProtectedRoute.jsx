/**
 * Protected Route Component
 * Guards routes that require authentication and/or admin privileges
 * Redirects unauthenticated users to login and handles role-based access
 */

// Commented out old implementation for reference
// import React, { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from './AuthContext';

// export default function ProtectedRoute({ children }) {
//   const { user, token, loading } = useContext(AuthContext);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <p className="text-gray-600">Loading...</p>
//       </div>
//     );
//   }

//   if (!token || !user) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// }

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Protected Route wrapper component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access granted
 * @param {boolean} props.adminOnly - If true, only admin users can access this route
 * @returns {React.ReactNode} Either the protected content or a redirect
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  // Get authentication state from context
  const { user, token, loading } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  // Check admin-only access
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Redirect admin users away from regular user routes
  if (!adminOnly && user.role === 'admin') {
    return <Navigate to="/admin-dashboard" />;
  }

  // Access granted - render protected content
  return children;
}