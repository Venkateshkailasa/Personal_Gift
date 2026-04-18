import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI, itemAPI } from '../api';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    productLink: '',
    description: '',
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [user, navigate, id]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const wishResponse = await wishlistAPI.getWishlist(id);
      setWishlist(wishResponse.data.wishlist);

      const itemsResponse = await itemAPI.getItems(id);
      setItems(itemsResponse.data.items);
    } catch (err) {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingItemId) {
        await itemAPI.updateItem(editingItemId, formData);
        setItems(items.map(item =>
          item._id === editingItemId ? { ...item, ...formData } : item
        ));
        setEditingItemId(null);
      } else {
        const response = await itemAPI.addItem({
          wishlistId: id,
          ...formData,
        });
        setItems([...items, response.data.item]);
      }
      setFormData({ name: '', productLink: '', description: '' });
      setShowAddItemForm(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      await itemAPI.deleteItem(itemId);
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const handleEditItem = (item) => {
    setFormData({
      name: item.name,
      productLink: item.productLink || '',
      description: item.description || '',
    });
    setEditingItemId(item._id);
    setShowAddItemForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', productLink: '', description: '' });
    setEditingItemId(null);
    setShowAddItemForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading wishlist...</p>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Wishlist not found</p>
      </div>
    );
  }

  const isOwner = user?._id === wishlist.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Gift Registry</h1>
          <Link to="/dashboard" className="text-indigo-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Wishlist Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{wishlist.title}</h2>
              <p className="text-gray-600 mb-2">{wishlist.description}</p>
              {wishlist.eventDate && (
                <p className="text-sm text-gray-500">
                  Event Date: {new Date(wishlist.eventDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Link
                  to={`/edit-wishlist/${id}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>

          {wishlist.isPublic && (
            <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-700 font-semibold mb-2">Share this wishlist:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/wishlist/${wishlist.publicLink}`}
                  className="flex-1 px-3 py-2 border border-blue-300 rounded bg-white text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/wishlist/${wishlist.publicLink}`);
                    alert('Link copied!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Item Form */}
        {isOwner && (
          <>
            <div className="mb-8">
              {!showAddItemForm ? (
                <button
                  onClick={() => setShowAddItemForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Add New Item
                </button>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    {editingItemId ? 'Edit Item' : 'Add New Item'}
                  </h3>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Item Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder="e.g., Sony Headphones"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Product Link</label>
                      <input
                        type="url"
                        name="productLink"
                        value={formData.productLink}
                        onChange={handleFormChange}
                        placeholder="https://..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        placeholder="Add item details..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        {editingItemId ? 'Update Item' : 'Add Item'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}

        {/* Items List */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Items ({items.length})
          </h3>

          {items.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-600">No items in this wishlist yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-lg shadow p-6 ${
                    item.status === 'taken' ? 'opacity-75 bg-gray-100' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-gray-800">{item.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'available' ? 'Available' : 'Taken'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 mb-3">{item.description}</p>
                  )}

                  {item.productLink && (
                    <a
                      href={item.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-sm mb-3 block"
                    >
                      View Product →
                    </a>
                  )}

                  {item.status === 'taken' && (
                    <p className="text-sm text-gray-600 mb-3">
                      Reserved by: {item.reserverName || 'Anonymous'}
                    </p>
                  )}

                  {isOwner && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
