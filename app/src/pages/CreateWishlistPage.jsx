import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI } from '../api';
import toast from 'react-hot-toast';
import { X, Tag, Lock, Globe, Users } from 'lucide-react';

export default function CreateWishlistPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'hidden',
    hideReserverName: false,
    eventDate: '',
    interests: []
  });
  const [interestInput, setInterestInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const fetchWishlist = useCallback(async () => {
    try {
      const response = await wishlistAPI.getWishlist(id);
      const wishlist = response.data.wishlist;
      setFormData({
        title: wishlist.title,
        description: wishlist.description || '',
        visibility: wishlist.visibility || (wishlist.isPublic ? 'public' : 'hidden'), // backwards compat
        hideReserverName: wishlist.hideReserverName,
        eventDate: wishlist.eventDate?.split('T')[0] || '',
        interests: wishlist.interests || []
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load wishlist');
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isEditing) fetchWishlist();
  }, [user, navigate, id, fetchWishlist, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (interestInput.trim() && !formData.interests.includes(interestInput.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interestInput.trim()]
      });
      setInterestInput('');
    }
  };

  const removeInterest = (tag) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== tag)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await wishlistAPI.updateWishlist(id, formData);
        toast.success('Wishlist updated!');
        navigate(`/wishlist/${id}`);
      } else {
        const response = await wishlistAPI.createWishlist(formData);
        toast.success('Wishlist created!');
        navigate(`/wishlist/${response.data.wishlist._id}`);
      }
    } catch (_err) {
      toast.error(_err?.response?.data?.message || 'Failed to save wishlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8">
          <h1 className="text-3xl font-extrabold text-white">
            {isEditing ? 'Edit Wishlist' : 'Create New Wishlist'}
          </h1>
          <p className="text-indigo-100 mt-2">
            Organize your dreams, interests, and items in one place.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Main Details */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <label className="block text-gray-700 font-bold mb-2">Wishlist Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., My Dream Birthday Gifts"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add some details about what this wishlist is for..."
                rows="3"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-bold">Interests (Tags)</label>
            <p className="text-sm text-gray-500">Add interests like 'Toys', 'Electronics', 'Books' to help people understand your preferences.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                placeholder="Type an interest..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAddInterest(e)}
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="bg-indigo-100 text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-200 transition-colors"
                title="Add Interest"
              >
                Add
              </button>
            </div>
            {formData.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.interests.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
                    {tag}
                    <button type="button" onClick={() => removeInterest(tag)} className="text-indigo-400 hover:text-indigo-800 transition-colors">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility & Privacy */}
          <div className="space-y-4 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Privacy & Visibility</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                formData.visibility === 'hidden' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input type="radio" name="visibility" value="hidden" checked={formData.visibility === 'hidden'} onChange={handleChange} className="hidden" />
                <Lock className={`mb-2 ${formData.visibility === 'hidden' ? 'text-indigo-600' : 'text-gray-400'}`} size={28} />
                <span className={`font-bold ${formData.visibility === 'hidden' ? 'text-indigo-800' : 'text-gray-700'}`}>Private</span>
                <span className="text-xs text-gray-500 mt-1">Only you can see this</span>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                formData.visibility === 'connections' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input type="radio" name="visibility" value="connections" checked={formData.visibility === 'connections'} onChange={handleChange} className="hidden" />
                <Users className={`mb-2 ${formData.visibility === 'connections' ? 'text-indigo-600' : 'text-gray-400'}`} size={28} />
                <span className={`font-bold ${formData.visibility === 'connections' ? 'text-indigo-800' : 'text-gray-700'}`}>Connections</span>
                <span className="text-xs text-gray-500 mt-1">Visible to your circle</span>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center text-center transition-all ${
                formData.visibility === 'public' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
              }`}>
                <input type="radio" name="visibility" value="public" checked={formData.visibility === 'public'} onChange={handleChange} className="hidden" />
                <Globe className={`mb-2 ${formData.visibility === 'public' ? 'text-indigo-600' : 'text-gray-400'}`} size={28} />
                <span className={`font-bold ${formData.visibility === 'public' ? 'text-indigo-800' : 'text-gray-700'}`}>Public</span>
                <span className="text-xs text-gray-500 mt-1">Shareable via link</span>
              </label>
            </div>

            {formData.visibility === 'public' && (
              <label className="flex items-center mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <input
                  type="checkbox"
                  name="hideReserverName"
                  checked={formData.hideReserverName}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="ml-3 text-yellow-800 font-medium">Hide reserver names until event date (Surprise me!)</span>
              </label>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Saving Wishlist...' : isEditing ? 'Update Wishlist' : 'Create Wishlist'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 border-2 border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
