/**
 * PublicWishlistPage Component
 * Displays public wishlists that can be viewed and reserved by anyone
 * Allows anonymous users to reserve items without authentication
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { wishlistAPI, itemAPI } from '../api';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function PublicWishlistPage() {
  // Component state management
  const [wishlist, setWishlist] = useState(null); // Public wishlist data
  const [items, setItems] = useState([]); // Items in the wishlist
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(''); // Error message
  const [reservingItemId, setReservingItemId] = useState(null); // ID of item being reserved
  const [reserverName, setReserverName] = useState(''); // Name of person reserving item
  const [showReserveModal, setShowReserveModal] = useState(false); // Reserve modal visibility
  const [selectedItem, setSelectedItem] = useState(null); // Currently selected item for reservation

  // Navigation and URL parameters
  const navigate = useNavigate();
  const { publicLink } = useParams(); // Public link ID from URL

  /**
   * Fetches public wishlist data and items
   * Memoized with useCallback to prevent unnecessary re-renders
   */
  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch public wishlist by link
      const wishResponse = await wishlistAPI.getPublicWishlist(publicLink);
      setWishlist(wishResponse.data.wishlist);

      // Fetch items for the wishlist
      const itemsResponse = await itemAPI.getItems(wishResponse.data.wishlist._id);
      setItems(itemsResponse.data.items || []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Wishlist not found or is not public';
      console.error('fetchWishlist error:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [publicLink]);

  // Fetch data on component mount
  useEffect(() => {
    fetchWishlist();
  }, [publicLink, fetchWishlist]);

  /**
   * Handles reserve button click
   * Opens reservation modal for the selected item
   * @param {Object} item - Item to reserve
   */
  const handleReserveClick = (item) => {
    setSelectedItem(item);
    setShowReserveModal(true);
  };

  /**
   * Handles item reservation submission
   * Reserves item with provided name
   */
  const handleReserveItem = async (e) => {
    e.preventDefault();
    if (!reserverName.trim()) {
      alert('Please enter your name');
      return;
    }

    setReservingItemId(selectedItem._id);
    try {
      // Reserve the item
      const response = await itemAPI.reserveItem(selectedItem._id, {
        reserverName: reserverName.trim()
      });

      // Update items list with reserved item
      setItems(items.map(item =>
        item._id === selectedItem._id ? response.data.item : item
      ));

      // Reset modal state
      setShowReserveModal(false);
      setReserverName('');
      setSelectedItem(null);
      alert('Item reserved successfully!');
    } catch {
      alert('Failed to reserve item');
    } finally {
      setReservingItemId(null);
    }
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <p className="text-white text-lg">Loading wishlist...</p>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // No wishlist found UI
  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Wishlist not found</p>
      </div>
    );
  }

  const availableCount = items.filter(item => item.status === 'available').length;
  const takenCount = items.filter(item => item.status === 'taken').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">🎁 Gift Registry</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Wishlist Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">{wishlist.title}</h2>
          <div className="text-gray-600 space-y-2">
            {wishlist.description && (
              <p className="text-lg">{wishlist.description}</p>
            )}
            {wishlist.eventDate && (
              <p>
                Event Date: <span className="font-semibold">
                  {new Date(wishlist.eventDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </p>
            )}
            <p>
              Wishlist by: <span className="font-semibold">{wishlist.userId.name}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{availableCount}</p>
              <p className="text-gray-600">Items Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{takenCount}</p>
              <p className="text-gray-600">Items Taken</p>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              This wishlist doesn't have any items yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(items || []).map((item) => (
              <div
                key={item._id}
                className={`rounded-lg shadow-md overflow-hidden transition ${
                  item.status === 'taken'
                    ? 'bg-gray-200 opacity-60'
                    : 'bg-white hover:shadow-lg'
                }`}
              >
                {/* Product Image */}
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center relative p-3 border-b border-gray-100 transition-colors overflow-hidden">
                   {item.productImage ? (
                      <img src={item.productImage} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'; }} className="w-full h-full object-contain transition-transform duration-500 hover:scale-105" />
                   ) : (
                      <ImageIcon className="text-gray-300 w-16 h-16" />
                   )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 flex-1 pr-3">
                      {item.name}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        item.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'available' ? '✓ Available' : '✗ Taken'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                  )}

                  {item.status === 'taken' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded border border-gray-300">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Reserved by:</span> {item.reserverName || 'Anonymous'}
                      </p>
                    </div>
                  )}

                  {item.productLink && (
                    <a
                      href={item.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full mb-4 py-2 bg-gray-50 hover:bg-indigo-50 text-indigo-600 font-medium rounded-xl transition-colors text-sm border border-gray-100"
                    >
                      <ExternalLink size={16} /> View/Purchase Item
                    </a>
                  )}

                  {item.status === 'available' && (
                    <button
                      onClick={() => handleReserveClick(item)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      Reserve This Item
                    </button>
                  )}

                  {item.status === 'taken' && (
                    <div className="w-full bg-gray-400 text-white font-bold py-2 px-4 rounded-lg text-center">
                      Already Taken
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reserve Modal */}
      {showReserveModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Reserve Item
            </h3>
            <p className="text-gray-600 mb-6">
              You're about to reserve: <strong>{selectedItem.name}</strong>
            </p>

            <form onSubmit={handleReserveItem} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={reserverName}
                  onChange={(e) => setReserverName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <p className="text-sm text-gray-600">
                Note: Your name will be recorded when you reserve this item.
              </p>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={reservingItemId === selectedItem._id}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {reservingItemId === selectedItem._id ? 'Reserving...' : 'Confirm Reserve'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReserveModal(false);
                    setReserverName('');
                    setSelectedItem(null);
                  }}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
