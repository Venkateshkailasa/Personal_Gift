import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI } from '../api';
import CircleSection from '../components/CircleSection';

export default function DashboardPage() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlists();
  }, [user, navigate]);

  const fetchWishlists = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await wishlistAPI.getMyWishlists();
      setWishlists(response.data.wishlists);
    } catch (err) {
      setError('Failed to fetch wishlists');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wishlist?')) return;

    try {
      await wishlistAPI.deleteWishlist(id);
      setWishlists(wishlists.filter(w => w._id !== id));
    } catch (err) {
      setError('Failed to delete wishlist');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Gift Registry</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-700">Welcome, {user?.name}</p>
            <Link
              to="/messages"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Messages
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Circle Section */}
        <div className="mb-12">
          <CircleSection />
        </div>

        {/* Wishlists Section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Wishlists</h2>
          <Link
            to="/create-wishlist"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Create New Wishlist
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading wishlists...</p>
          </div>
        ) : wishlists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No wishlists created yet</p>
            <Link
              to="/create-wishlist"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg inline-block"
            >
              Create Your First Wishlist
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlists.map((wishlist) => (
              <div
                key={wishlist._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{wishlist.title}</h3>
                <p className="text-gray-600 mb-4">{wishlist.description || 'No description'}</p>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Created: {new Date(wishlist.createdAt).toLocaleDateString()}
                  </p>
                  {wishlist.eventDate && (
                    <p className="text-sm text-gray-500">
                      Event Date: {new Date(wishlist.eventDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {wishlist.isPublic && (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-700 font-semibold">Public Link:</p>
                    <p className="text-xs text-blue-600 break-all">
                      {window.location.origin}/wishlist/{wishlist.publicLink}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/wishlist/${wishlist.publicLink}`);
                        alert('Link copied to clipboard');
                      }}
                      className="text-xs text-blue-600 hover:underline mt-2"
                    >
                      Copy Link
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    to={`/wishlist/${wishlist._id}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-center font-semibold"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(wishlist._id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
