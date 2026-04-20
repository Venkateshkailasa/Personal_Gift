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
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <Toaster position="top-center" />
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
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
          
          <Route path="/wishlist/:publicLink" element={<PublicWishlistPage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
