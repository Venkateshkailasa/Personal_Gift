/**
 * CreateWishlistPage Component
 * Form for creating new wishlists or editing existing ones
 * Handles wishlist metadata, visibility settings, and bulk item addition
 */

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI, itemAPI } from '../api';
import toast from 'react-hot-toast';
import { X, Tag, Lock, Globe, Users, PackagePlus, Link2, Image as ImageIconLucide, Trash2 } from 'lucide-react';

export default function CreateWishlistPage() {
  // Main form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'hidden', // hidden, friends_only, public
    hideReserverName: false, // Hide who reserved items
    eventDate: '', // Optional event date
    interests: [] // Tags/interests for the wishlist
  });

  // Interest input state
  const [interestInput, setInterestInput] = useState('');

  // Products to add to wishlist
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', productLink: '', productImage: '', description: '' });

  // UI state
  const [loading, setLoading] = useState(false);

  // Context and navigation hooks
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Wishlist ID for editing (optional)
  const isEditing = !!id; // Determine if we're editing or creating

  /**
   * Fetches existing wishlist data for editing
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const fetchWishlist = useCallback(async () => {
    try {
      const response = await wishlistAPI.getWishlist(id);
      const wishlist = response.data.wishlist;
      setFormData({
        title: wishlist.title,
        description: wishlist.description || '',
        visibility: wishlist.visibility || (wishlist.isPublic ? 'public' : 'hidden'), // backwards compatibility
        hideReserverName: wishlist.hideReserverName,
        eventDate: wishlist.eventDate?.split('T')[0] || '',
        interests: wishlist.interests || []
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load wishlist');
    }
  }, [id]);

  // Fetch data on component mount if editing
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isEditing) fetchWishlist();
  }, [user, navigate, id, fetchWishlist, isEditing]);

  /**
   * Handles form input changes
   * Supports text inputs, checkboxes, and other input types
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  /**
   * Adds a new interest tag to the wishlist
   * Prevents duplicates and empty tags
   */
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

  /**
   * Removes an interest tag from the wishlist
   * @param {string} tag - Tag to remove
   */
  const removeInterest = (tag) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter(i => i !== tag)
    });
  };

  /**
   * Adds a new product to the products list
   * Validates that product name is provided
   */
  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setProducts([...products, { ...newProduct }]);
    setNewProduct({ name: '', productLink: '', productImage: '', description: '' });
  };

  /**
   * Removes a product from the products list
   * @param {number} idx - Index of product to remove
   */
  const removeProduct = (idx) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  /**
   * Handles form submission for creating or updating wishlist
   * Creates/updates wishlist and adds any products
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // Update existing wishlist
        await wishlistAPI.updateWishlist(id, formData);
        toast.success('Wishlist updated!');
        navigate(`/wishlist/${id}`);
      } else {
        const response = await wishlistAPI.createWishlist(formData);
        const newWishlistId = response.data.wishlist._id;
        
        if (products.length > 0) {
          await Promise.all(products.map(p => itemAPI.addItem({ ...p, wishlistId: newWishlistId })));
        }

        toast.success('Wishlist created!');
        navigate(`/wishlist/${newWishlistId}`);
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

          {/* Add Products Section */}
          {!isEditing && (
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <PackagePlus className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold text-gray-800">Add Products to Wishlist</h3>
              </div>
              
              <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g., Sony Headphones"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2"><Link2 size={16}/> Product Link</label>
                    <input
                      type="url"
                      value={newProduct.productLink}
                      onChange={e => setNewProduct({...newProduct, productLink: e.target.value})}
                      placeholder="https://amazon.com/..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2"><ImageIconLucide size={16}/> Image URL</label>
                    <input
                      type="url"
                      value={newProduct.productImage}
                      onChange={e => setNewProduct({...newProduct, productImage: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    rows="2"
                    placeholder="Any specifics, color, size?"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold py-3 rounded-xl transition-colors border border-indigo-200"
                >
                  + Add Product to List
                </button>
              </div>

              {products.length > 0 && (
                <div className="space-y-3">
                  <p className="font-bold text-gray-700 text-sm">Products Added ({products.length}):</p>
                  {products.map((prod, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl items-center shadow-sm">
                      <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                         {prod.productImage ? (
                            <img src={prod.productImage} alt={prod.name} className="w-full h-full object-cover" />
                         ) : (
                            <ImageIconLucide className="text-gray-300" size={24}/>
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{prod.name}</h4>
                        {prod.productLink && <a href={prod.productLink} target="_blank" rel="noopener noreferrer" className="text-indigo-500 text-xs font-semibold hover:underline flex items-center gap-1"><Link2 size={12}/> Link</a>}
                      </div>
                      <button type="button" onClick={() => removeProduct(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
              onClick={() => navigate(-1)}
              className="px-8 py-4 border-2 border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-bold premium-shadow-hover"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
