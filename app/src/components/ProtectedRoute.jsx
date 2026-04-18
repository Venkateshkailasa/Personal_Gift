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

export default function ProtectedRoute({ children }) {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" />;
  }

  return children;
}