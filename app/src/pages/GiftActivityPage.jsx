import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { itemAPI, circleAPI, giftAPI } from '../api';

export default function GiftActivityPage() {
  const [items, setItems] = useState([]);
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isContributor, setIsContributor] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { friendId } = useParams();

  const fetchGiftActivity = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // First get friend details
      const circleResponse = await circleAPI.getMyCircle();
      const friendData = circleResponse.data.circles.find(c => c._id === friendId);
      if (!friendData) {
        setError('Friend not found in your circle');
        return;
      }
      setFriend(friendData);

      // Fetch both item activities and sent gifts in parallel
      const [activityResponse, sentGiftsResponse] = await Promise.all([
        itemAPI.getGiftActivityForFriend(friendId),
        giftAPI.getSentGiftsForFriend(friendId)
      ]);

      const itemsData = activityResponse.data.items || [];
      const sentGiftsData = sentGiftsResponse.data.gifts || [];

      // Combine and format the data
      const combinedActivities = [
        // Format item activities
        ...itemsData.map(item => ({
          id: item._id,
          type: 'item',
          name: item.name,
          description: item.description,
          productLink: item.productLink,
          imageUrl: item.productImage,
          orderedBy: item.reserverName || item.reservedBy?.name || 'Anonymous',
          status: item.status,
          platform: item.platform,
          orderNotes: item.orderNotes,
          reservedAt: item.reservedAt,
          orderedAt: item.orderedAt,
          deliveredAt: item.deliveredAt,
          wishlistTitle: item.wishlistId?.title
        })),
        // Format sent gifts
        ...sentGiftsData.map(gift => ({
          id: gift._id,
          type: 'sent_gift',
          name: gift.name,
          description: gift.description,
          productLink: gift.link,
          imageUrl: gift.images?.[0], // Use first image if available
          orderedBy: gift.sender?.name || 'Anonymous',
          status: 'sent',
          platform: gift.platform || null,
          orderNotes: null,
          reservedAt: null,
          orderedAt: gift.createdAt,
          deliveredAt: null,
          wishlistTitle: null
        }))
      ];

      // Sort by most recent activity
      combinedActivities.sort((a, b) => {
        const dateA = new Date(a.orderedAt || a.reservedAt || a.deliveredAt || 0);
        const dateB = new Date(b.orderedAt || b.reservedAt || b.deliveredAt || 0);
        return dateB - dateA;
      });

      setItems(combinedActivities);
      
      // Check if current user is a contributor
      const isUserContributor = combinedActivities.some(activity => 
        (activity.type === 'item' && activity.reservedBy?._id === user.id && 
         (activity.status === 'ordered' || activity.status === 'delivered')) ||
        (activity.type === 'sent_gift' && activity.sender?._id === user.id)
      );
      setIsContributor(isUserContributor);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load gift activity';
      console.error('fetchGiftActivity error:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [friendId, user.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchGiftActivity();
  }, [user, navigate, friendId, fetchGiftActivity]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reserved': return '🔒';
      case 'ordered': return '📦';
      case 'delivered': return '✅';
      case 'sent': return '🎁';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
         <div className="max-w-7xl mx-auto space-y-6">
            <div className="h-32 bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1, 2, 3, 4].map(idx => (
                 <div key={idx} className="h-64 bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse p-6">
                    <div className="flex justify-between"><div className="w-1/2 h-6 bg-gray-200 rounded"></div><div className="w-1/4 h-6 bg-gray-200 rounded-full"></div></div>
                    <div className="mt-4 w-full h-32 bg-gray-100 rounded-lg"></div>
                    <div className="mt-4 space-y-2"><div className="w-3/4 h-4 bg-gray-200 rounded"></div><div className="w-1/2 h-4 bg-gray-200 rounded"></div></div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Friend not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
      `}</style>
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

        {/* Friend Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Gifts Ordered for {friend.name}
              </h2>
              <p className="text-gray-600">
                Track gift progress and avoid duplicates
              </p>
              {isContributor && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ You have contributed to gifts for this friend
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">
            Gift Activity ({items.length})
          </h3>

          {items.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow">
              <p className="text-gray-600">No gift activity yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Items will appear here once friends start reserving or ordering gifts
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-gray-800">{activity.name}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(activity.status)}`}
                    >
                      {getStatusIcon(activity.status)} {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </span>
                  </div>

                  {/* Image Display */}
                  {activity.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={activity.imageUrl}
                        alt={activity.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Description */}
                  {activity.description && (
                    <p className="text-gray-700 mb-3">{activity.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600">
                    {activity.wishlistTitle && (
                      <p><strong>Wishlist:</strong> {activity.wishlistTitle}</p>
                    )}

                    <p><strong>Ordered by:</strong> {activity.orderedBy}</p>

                    {activity.platform && <p><strong>Platform:</strong> {activity.platform}</p>}

                    {activity.reservedAt && (
                      <p><strong>Reserved:</strong> {formatDate(activity.reservedAt)}</p>
                    )}

                    {activity.orderedAt && activity.type === 'item' && (
                      <p><strong>Ordered:</strong> {formatDate(activity.orderedAt)}</p>
                    )}

                    {activity.orderedAt && activity.type === 'sent_gift' && (
                      <p><strong>Sent / Added:</strong> {formatDate(activity.orderedAt)}</p>
                    )}

                    {activity.deliveredAt && (
                      <p><strong>Delivered:</strong> {formatDate(activity.deliveredAt)}</p>
                    )}

                    {activity.orderNotes && (
                      <p><strong>Notes:</strong> {activity.orderNotes}</p>
                    )}
                  </div>

                  {activity.productLink && (
                    <a
                      href={activity.productLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline text-sm mt-3 block"
                    >
                      View Product →
                    </a>
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