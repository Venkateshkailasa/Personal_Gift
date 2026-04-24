/**
 * Main App component for the Personal Gift application
 * Sets up routing, authentication context, and global components
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CreateWishlistPage from './pages/CreateWishlistPage';
import WishlistPage from './pages/WishlistPage';
import PublicWishlistPage from './pages/PublicWishlistPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import GiftActivityPage from './pages/GiftActivityPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    // React Router setup with future flags for compatibility
    <Router
      future={{
        v7_startTransition: true, // Enable React 18 concurrent features
        v7_relativeSplatPath: true // Enable relative path resolution
      }}
    >
      {/* Authentication context provider for global user state */}
      <AuthProvider>
        {/* Toast notifications for user feedback */}
        <Toaster position="top-center" />

        {/* Global header component */}
        <Header />

        {/* Application routes */}
        <Routes>
          {/* Public routes - accessible without authentication */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/profile-setup"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-wishlist"
            element={
              <ProtectedRoute>
                <CreateWishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-wishlist/:id"
            element={
              <ProtectedRoute>
                <CreateWishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist/:id"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gift-activity/:friendId"
            element={
              <ProtectedRoute>
                <GiftActivityPage />
              </ProtectedRoute>
            }
          />

          {/* Public route for shared wishlists */}
          <Route path="/wishlist/:publicLink" element={<PublicWishlistPage />} />

          {/* Admin-only routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route - redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
