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
import ProfileSetupPage from './pages/ProfileSetupPage';
import MessagesPage from './pages/MessagesPage';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
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
                <ProfileSetupPage />
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
          
          <Route path="/wishlist/:publicLink" element={<PublicWishlistPage />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
