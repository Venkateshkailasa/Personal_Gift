/**
 * HomePage Component
 * Landing page for the Personal Gift application
 * Shows marketing content and redirects authenticated users to dashboard
 */

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function HomePage() {
  // Get current user from auth context
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo/Brand */}
          <h1 className="text-2xl font-bold text-indigo-600">🎁 Gift Registry</h1>

          {/* Auth navigation links */}
          <div className="flex gap-4">
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-white">
        <div className="text-center">
          {/* Main headline */}
          <h2 className="text-5xl font-bold mb-4">Share Your Wishlist</h2>
          <p className="text-xl mb-8 text-gray-100">
            Create wishlists, share with friends, and never receive duplicate gifts again
          </p>
          {/* Call-to-action button */}
          <Link
            to="/signup"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition inline-block"
          >
            Get Started Free
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {/* Feature 1: Create Wishlists */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-center border border-white border-opacity-20">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-2xl font-bold mb-3">Create Wishlists</h3>
            <p>
              Easily create multiple wishlists for different occasions like birthdays,
              weddings, and celebrations
            </p>
          </div>

          {/* Feature 2: Share Links */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-center border border-white border-opacity-20">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-2xl font-bold mb-3">Share Links</h3>
            <p>
              Generate public links to share your wishlists with friends and family
              through email or social media
            </p>
          </div>

          {/* Feature 3: Avoid Duplicates */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-8 text-center border border-white border-opacity-20">
            <div className="text-4xl mb-4">✓</div>
            <h3 className="text-2xl font-bold mb-3">Avoid Duplicates</h3>
            <p>
              Friends can reserve items they plan to buy, preventing duplicate
              purchases
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-20 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-12 border border-white border-opacity-20">
          <h3 className="text-3xl font-bold mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            {/* Step 1 */}
            <div>
              <div className="text-4xl font-bold mb-2">1</div>
              <p className="font-semibold">Create Account</p>
            </div>
            {/* Arrow separator */}
            <div className="flex items-center justify-center">
              <div className="text-2xl">→</div>
            </div>
            {/* Step 2 */}
            <div>
              <div className="text-4xl font-bold mb-2">2</div>
              <p className="font-semibold">Make Wishlist</p>
            </div>
            {/* Arrow separator */}
            <div className="flex items-center justify-center">
              <div className="text-2xl">→</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3</div>
              <p className="font-semibold">Add Items</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-2xl">→</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4</div>
              <p className="font-semibold">Share & Relax</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <h3 className="text-3xl font-bold mb-6">Ready to get started?</h3>
          <div className="flex gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:bg-opacity-10 transition"
            >
              Already Have Account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black bg-opacity-20 text-white mt-20 py-8">
        <div className="text-center">
          <p>&copy; 2024 Gift Registry. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
