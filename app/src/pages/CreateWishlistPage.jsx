import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI } from '../api';

export default function CreateWishlistPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: false,
    hideReserverName: false,
    eventDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditing) {
      fetchWishlist();
    }
  }, [user, navigate, id]);

  const fetchWishlist = async () => {
    try {
      const response = await wishlistAPI.getWishlist(id);
      setFormData({
        title: response.data.wishlist.title,
        description: response.data.wishlist.description || '',
        isPublic: response.data.wishlist.isPublic,
        hideReserverName: response.data.wishlist.hideReserverName,
        eventDate: response.data.wishlist.eventDate?.split('T')[0] || '',
      });
    } catch (err) {
      setError('Failed to load wishlist');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await wishlistAPI.updateWishlist(id, formData);
        navigate(`/wishlist/${id}`);
      } else {
        const response = await wishlistAPI.createWishlist(formData);
        navigate(`/wishlist/${response.data.wishlist._id}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          {isEditing ? 'Edit Wishlist' : 'Create New Wishlist'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Wishlist Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Birthday Wishlist"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this wishlist"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Event Date</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="ml-3 text-gray-700">Make this wishlist public (share with friends)</span>
            </label>

            {formData.isPublic && (
              <label className="flex items-center ml-6">
                <input
                  type="checkbox"
                  name="hideReserverName"
                  checked={formData.hideReserverName}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="ml-3 text-gray-700">Hide reserver names until event date</span>
              </label>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Wishlist' : 'Create Wishlist'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
