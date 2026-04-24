/**
 * WishlistPage Component
 * Displays individual wishlist with items and management capabilities
 * Allows adding, editing, and deleting wishlist items
 */

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI, itemAPI } from '../api';
import toast from 'react-hot-toast';
import { ExternalLink, Edit2, Trash2, Tag, Gift, Link2, Image as ImageIcon } from 'lucide-react';

export default function WishlistPage() {
  // Component state management
  const [wishlist, setWishlist] = useState(null); // Current wishlist data
  const [items, setItems] = useState([]); // Items in the wishlist
  const [loading, setLoading] = useState(true); // Loading state
  const [showAddItemForm, setShowAddItemForm] = useState(false); // Add item form visibility
  const [editingItemId, setEditingItemId] = useState(null); // ID of item being edited

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    name: '',
    productLink: '',
    productImage: '',
    description: '',
  });

  // Context and navigation hooks
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Wishlist ID from URL

  /**
   * Fetches wishlist data and items
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch wishlist details
      const wishResponse = await wishlistAPI.getWishlist(id);
      setWishlist(wishResponse.data.wishlist);

      // Fetch items in the wishlist
      const itemsResponse = await itemAPI.getItems(id);
      setItems(itemsResponse.data.items || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, navigate, id, fetchWishlist]);

  /**
   * Handles form input changes
   * Updates form data state with new values
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  /**
   * Validates if a string is a valid URL
   * @param {string} urlString - URL to validate
   * @returns {boolean} True if valid URL, false otherwise
   */
  const isValidUrl = (urlString) => {
    if (!urlString) return false;
    try {
      return Boolean(new URL(urlString));
    } catch {
      return false;
    }
  };

  /**
   * Handles adding new item or updating existing item
   * Validates URLs before submission
   */
  const handleAddItem = async (e) => {
    e.preventDefault();

    // Validate product link URL if provided
    if (formData.productLink && !isValidUrl(formData.productLink)) {
      toast.error("Valid Product Link is required if provided.");
      return;
    }

    // Validate image URL if provided
    if (formData.productImage && !isValidUrl(formData.productImage)) {
      toast.error("Valid Image URL is required if provided.");
      return;
    }

    try {
      if (editingItemId) {
        // Update existing item
        await itemAPI.updateItem(editingItemId, formData);
        toast.success("Item updated successfully");
        setItems(items.map(item =>
          item._id === editingItemId ? { ...item, ...formData } : item
        ));
      } else {
        // Add new item
        const response = await itemAPI.addItem({
          wishlistId: id,
          ...formData,
        });
        toast.success("Item added successfully");
        setItems([...items, response.data.item]);
      }
      handleCancelEdit();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save item');
    }
  };

  /**
   * Handles item deletion with confirmation
   * @param {string} itemId - ID of item to delete
   */
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      await itemAPI.deleteItem(itemId);
      toast.success("Item deleted");
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleEditItem = (item) => {
    setFormData({
      name: item.name,
      productLink: item.productLink || '',
      productImage: item.productImage || '',
      description: item.description || '',
    });
    setEditingItemId(item._id);
    setShowAddItemForm(true);
  };

  const handleReserveItem = async (itemId) => {
    const reserverName = prompt('Enter your name for the reservation:');
    if (!reserverName) return;

    try {
      await itemAPI.reserveItem(itemId, { reserverName });
      toast.success("Item reserved!");
      fetchWishlist();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reserve item');
    }
  };

  const handleUnreserveItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to unreserve this item?')) return;
    try {
      await itemAPI.unreserveItem(itemId);
      toast.success("Item unreserved!");
      fetchWishlist();
    } catch {
      toast.error('Failed to unreserve item');
    }
  };

  const handleOrderItem = async (itemId) => {
    const platform = prompt('Where did you order from? (e.g., Amazon, Flipkart):');
    const orderNotes = prompt('Any order notes? (optional):');
    try {
      await itemAPI.orderItem(itemId, { platform, orderNotes });
      toast.success("Item marked as ordered");
      fetchWishlist();
    } catch {
      toast.error('Failed to mark item as ordered');
    }
  };

  const handleDeliverItem = async (itemId) => {
    if (!window.confirm('Mark this item as delivered?')) return;
    try {
      await itemAPI.deliverItem(itemId);
      toast.success("Item marked as delivered");
      fetchWishlist();
    } catch {
      toast.error('Failed to mark item as delivered');
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', productLink: '', productImage: '', description: '' });
    setEditingItemId(null);
    setShowAddItemForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading wishlist...</p>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Wishlist not found</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-600 hover:underline">
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?._id === wishlist.userId?._id || user?._id === wishlist.userId;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      
      {/* Header Splash */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-8 pb-16 px-4 mb-4">
        <div className="max-w-6xl mx-auto flex justify-between items-start">
          <div className="text-white">
            <h1 className="text-4xl font-extrabold mb-2">{wishlist.title}</h1>
            {wishlist.description && <p className="text-indigo-100 text-lg max-w-2xl">{wishlist.description}</p>}
            
            <div className="flex flex-wrap gap-2 mt-4">
               {wishlist.eventDate && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shadow-sm">
                    📅 Event: {new Date(wishlist.eventDate).toLocaleDateString()}
                  </span>
                )}
                {wishlist.interests?.map((interest, idx) => (
                  <span key={idx} className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm shadow-sm flex items-center gap-1">
                    <Tag size={14} /> {interest}
                  </span>
                ))}
            </div>
          </div>
          {isOwner && (
            <Link
              to={`/edit-wishlist/${id}`}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm font-medium"
            >
              <Edit2 size={18} /> Edit Wishlist
            </Link>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 -mt-10">
        
        {/* Share Section for Public ones */}
        {wishlist.visibility === 'public' && isOwner && (
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 mb-8 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <Globe className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-bold mb-1">This wishlist is Public</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/wishlist/${wishlist.publicLink}`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 text-sm focus:outline-none"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/wishlist/${wishlist.publicLink}`);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Form */}
        {isOwner && (
          <div className="mb-10">
            {!showAddItemForm ? (
              <button
                onClick={() => setShowAddItemForm(true)}
                className="w-full border-2 border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 font-bold px-6 py-8 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 text-lg"
              >
                <div className="p-2 border-2 border-indigo-300 rounded-full"><Gift size={24} /></div>
                Add a New Item to your Wishlist
              </button>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
                  <h3 className="text-xl font-extrabold text-indigo-900">
                    {editingItemId ? 'Edit Item' : 'Add New Item'}
                  </h3>
                </div>
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  <form onSubmit={handleAddItem} className="flex-1 space-y-5">
                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Item Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g., Sony Noise Cancelling Headphones"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2"><Link2 size={16}/> Product URL</label>
                        <input
                          type="url"
                          name="productLink"
                          value={formData.productLink}
                          onChange={handleFormChange}
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2"><ImageIcon size={16}/> Image URL</label>
                        <input
                          type="url"
                          name="productImage"
                          value={formData.productImage}
                          onChange={handleFormChange}
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Why do you want this? Any specific color or size?"
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors"
                      >
                        {editingItemId ? 'Update Item' : 'Save Item'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  
                  {/* Image Preview Area */}
                  <div className="w-full md:w-64 flex flex-col pt-8">
                    <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Image Preview</p>
                    <div className="w-full aspect-square bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative shadow-inner">
                      {formData.productImage && isValidUrl(formData.productImage) ? (
                        <div className="absolute inset-0 w-full h-full p-2">
                           <div className="w-full h-full bg-contain bg-center bg-no-repeat rounded-xl" style={{backgroundImage: `url(${formData.productImage})`}}></div>
                        </div>
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <ImageIcon size={48} className="mb-2 opacity-50" />
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items Grid */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-extrabold text-gray-800">
            Items ({items.length})
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Gift size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No items added to this wishlist yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(items || []).map((item) => (
              <div
                key={item._id}
                className={`group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden ${
                  item.status !== 'available' ? 'opacity-80' : ''
                }`}
              >
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center relative p-3 border-b border-gray-100 group-hover:bg-indigo-50/50 transition-colors overflow-hidden">
                   {item.productImage ? (
                      <img src={item.productImage} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'; }} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                   ) : (
                      <ImageIcon className="text-gray-300 w-16 h-16" />
                   )}
                   
                   {/* Status Badge */}
                   <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
                        item.status === 'available' ? 'bg-green-100/90 text-green-800 border border-green-200' : 
                        item.status === 'reserved' ? 'bg-yellow-100/90 text-yellow-800 border border-yellow-200' : 
                        item.status === 'ordered' ? 'bg-blue-100/90 text-blue-800 border border-blue-200' : 
                        item.status === 'delivered' ? 'bg-indigo-100/90 text-indigo-800 border border-indigo-200' : 
                        'bg-red-100/90 text-red-800'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                   </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight flex-1">{item.name}</h4>
                  
                  {item.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.description}</p>
                  )}

                  {/* Actions area below */}
                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                    
                    {item.productLink ? (
                      <a
                        href={item.productLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-medium rounded-xl transition-colors text-sm border border-gray-100"
                      >
                        <ExternalLink size={16} /> View Product
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-400 font-medium rounded-xl text-sm border border-gray-100 opacity-60 cursor-not-allowed">
                        <ExternalLink size={16} /> View Product
                      </button>
                    )}
                    
                    {(item.status !== 'available') && (
                      <div className="text-xs text-center p-2 bg-gray-50 rounded-lg text-gray-600">
                        {item.status.toUpperCase()} by: <span className="font-bold">{item.reserverName || 'Anonymous'}</span>
                        {item.platform && <><br/>via {item.platform}</>}
                      </div>
                    )}

                    {/* Guest Actions */}
                    {!isOwner && item.status === 'available' && (
                      <button
                        onClick={() => handleReserveItem(item._id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm shadow-green-200 text-sm"
                      >
                        Reserve Item
                      </button>
                    )}

                    {!isOwner && item.status !== 'available' && item.reservedBy === user._id && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.status === 'reserved' && (
                          <button
                            onClick={() => handleOrderItem(item._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-xs font-bold"
                          >
                            Mark Ordered
                          </button>
                        )}
                        {item.status === 'ordered' && (
                          <button
                            onClick={() => handleDeliverItem(item._id)}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-xs font-bold"
                          >
                            Mark Delivered
                          </button>
                        )}
                        <button
                          onClick={() => handleUnreserveItem(item._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-xl text-xs font-bold border border-red-100"
                        >
                          Unreserve
                        </button>
                      </div>
                    )}

                    {/* Owner Actions */}
                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 flex items-center justify-center gap-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium transition-colors text-sm"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 w-10 rounded-xl transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
