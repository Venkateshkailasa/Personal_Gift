import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { wishlistAPI, itemAPI } from '../api';

export default function PublicWishlistPage() {
  const [wishlist, setWishlist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reservingItemId, setReservingItemId] = useState(null);
  const [reserverName, setReserverName] = useState('');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();
  const { publicLink } = useParams();

  useEffect(() => {
    fetchWishlist();
  }, [publicLink]);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    try {
      const wishResponse = await wishlistAPI.getPublicWishlist(publicLink);
      setWishlist(wishResponse.data.wishlist);

      const itemsResponse = await itemAPI.getItems(wishResponse.data.wishlist._id);
      setItems(itemsResponse.data.items);
    } catch (err) {
      setError('Wishlist not found or is not public');
    } finally {
      setLoading(false);
    }
  };

  const handleReserveClick = (item) => {
    setSelectedItem(item);
    setShowReserveModal(true);
  };

  const handleReserveItem = async (e) => {
    e.preventDefault();
    if (!reserverName.trim()) {
      alert('Please enter your name');
      return;
    }

    setReservingItemId(selectedItem._id);
    try {
      const response = await itemAPI.reserveItem(selectedItem._id, { 
        reserverName: reserverName.trim() 
      });
      setItems(items.map(item =>
        item._id === selectedItem._id ? response.data.item : item
      ));
      setShowReserveModal(false);
      setReserverName('');
      setSelectedItem(null);
      alert('Item reserved successfully!');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to reserve item');
    } finally {
      setReservingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <p className="text-white text-lg">Loading wishlist...</p>
      </div>
    );
  }

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
            {items.map((item) => (
              <div
                key={item._id}
                className={`rounded-lg shadow-md overflow-hidden transition ${
                  item.status === 'taken'
                    ? 'bg-gray-200 opacity-60'
                    : 'bg-white hover:shadow-lg'
                }`}
              >
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
                      className="inline-block text-indigo-600 hover:text-indigo-800 font-semibold text-sm mb-4"
                    >
                      View Product →
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
