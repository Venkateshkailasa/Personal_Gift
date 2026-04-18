import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { circleAPI, wishlistAPI, itemAPI, giftAPI } from '../api';

const calculateAge = (dateString) => {
  if (!dateString) return null;
  const dob = new Date(dateString);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms); 
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const calculateAnniversary = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const diff_ms = Date.now() - date.getTime();
  const dt = new Date(diff_ms); 
  const years = Math.abs(dt.getUTCFullYear() - 1970);
  return getOrdinal(years) + " Anniversary";
};

const CircleSection = () => {
  const navigate = useNavigate();
  const [circle, setCircle] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [friendRequests, setFriendRequests] = useState({ received: [], sent: [] });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [giftModal, setGiftModal] = useState({ isOpen: false, friend: null, wishlists: [], items: [] });
  const [formData, setFormData] = useState({
    username: '',
    relationship: 'friend',
    requestMessage: ''
  });

  const [sendGiftForm, setSendGiftForm] = useState({
    name: '',
    description: '',
    link: '',
    price: '',
    privacy: 'public_to_friends'
  });

  useEffect(() => {
    fetchCircle();
    fetchUpcomingEvents();
    fetchFriendRequests();
    fetchNotifications();
  }, []);

  const fetchCircle = async () => {
    setLoading(true);
    try {
      const response = await circleAPI.getMyCircle();
      setCircle(response.data.circles);
    } catch (err) {
      setError('Failed to fetch circle');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await circleAPI.getUpcomingEvents();
      setUpcomingEvents(response.data.events);
    } catch (err) {
      console.error('Failed to fetch upcoming events:', err);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await circleAPI.getFriendRequests();
      setFriendRequests(response.data);
    } catch (err) {
      console.error('Failed to fetch friend requests:', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await circleAPI.getNotifications();
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await circleAPI.addToCircle(formData);

      if (response.data.isRequest) {
        alert('Connection request sent successfully!');
        fetchFriendRequests();
      } else {
        fetchCircle();
      }

      setFormData({
        username: '',
        relationship: 'friend',
        requestMessage: ''
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add person to circle');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await circleAPI.acceptFriendRequest(requestId);
      fetchFriendRequests();
      fetchCircle();
      fetchUpcomingEvents();
      fetchNotifications();
    } catch (err) {
      setError('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await circleAPI.rejectFriendRequest(requestId);
      fetchFriendRequests();
    } catch (err) {
      setError('Failed to reject friend request');
    }
  };

  const handleRemovePerson = async (personId) => {
    try {
      await circleAPI.removeFromCircle(personId);
      fetchCircle();
      fetchFriendRequests();
      fetchNotifications();
    } catch (err) {
      setError('Failed to remove person from circle');
    }
  };

  const handleOpenMessage = (friend) => {
    if (!friend.requester) {
      setError('You can only message connected friends with registered accounts.');
      return;
    }

    navigate('/messages');
  };

  const handleSendGift = async (friend) => {
    if (!friend.requester) {
      setError('You can only send gifts to connected friends with registered accounts.');
      return;
    }

    setLoading(true);
    try {
      const targetUserId = friend.requester._id || friend.requester;
      const response = await wishlistAPI.getFriendWishlists(targetUserId);
      setGiftModal({
        isOpen: true,
        friend,
        wishlists: response.data.wishlists,
        items: []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load friend\'s wishlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseGiftModal = () => {
    setGiftModal({ isOpen: false, friend: null, wishlists: [], items: [] });
    setSendGiftForm({ name: '', description: '', link: '', price: '', privacy: 'public_to_friends' });
  };

  const handleSendGiftSubmit = async (e) => {
    e.preventDefault();
    if (!giftModal.friend) return;
    setLoading(true);
    try {
      await giftAPI.sendGift({
        receiverFriendId: giftModal.friend._id,
        ...sendGiftForm
      });
      alert('Gift sent successfully!');
      handleCloseGiftModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send gift');
    } finally {
      setLoading(false);
    }
  };

  const handlePrefillGift = (item) => {
    setSendGiftForm({
      name: item.name || '',
      description: item.description || '',
      link: item.productLink || item.link || '',
      price: item.price || '',
      privacy: 'public_to_friends'
    });
  };

  const generateSearchUrl = (platform, itemName) => {
    const encodedItem = encodeURIComponent(itemName);
    switch (platform.name.toLowerCase()) {
      case 'amazon':
        return `${platform.url}/s?k=${encodedItem}`;
      case 'flipkart':
        return `${platform.url}/search?q=${encodedItem}`;
      case 'myntra':
        return `${platform.url}/${encodedItem.replace(/\s+/g, '-').toLowerCase()}`;
      case 'ajio':
        return `${platform.url}/search/${encodedItem}`;
      case 'meesho':
        return `${platform.url}/search?q=${encodedItem}`;
      case 'nykaa':
        return `${platform.url}/search/result/?q=${encodedItem}`;
      case 'tata cliq':
        return `${platform.url}/search/?search=${encodedItem}`;
      case 'reliance digital':
        return `${platform.url}/search?q=${encodedItem}`;
      default:
        return platform.url;
    }
  };

  const getRelationshipColor = (relationship) => {
    switch (relationship) {
      case 'family': return 'bg-green-100 text-green-800';
      case 'friend': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'birthday': return '🎂';
      case 'anniversary': return '💍';
      case 'graduation': return '🎓';
      default: return '📅';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request': return '👥';
      case 'friend_accept': return '✅';
      case 'message': return '💬';
      default: return '🔔';
    }
  };

  const totalNotificationCount = notifications.length + upcomingEvents.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">My Circle</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg relative"
          >
            👥 Requests
            {(friendRequests.received.length + friendRequests.sent.length) > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {friendRequests.received.length + friendRequests.sent.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg relative"
          >
            🔔 Notifications
            {totalNotificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalNotificationCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Add Person
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Friend Requests Popup */}
      {showRequests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Friend Requests</h4>
              <button
                onClick={() => setShowRequests(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Received Requests */}
            <div className="mb-6">
              <h5 className="text-lg font-semibold mb-3 text-green-700">Received Requests</h5>
              {friendRequests.received.length === 0 ? (
                <p className="text-gray-600">No pending friend requests</p>
              ) : (
                <div className="space-y-3">
                  {friendRequests.received.map((request) => (
                    <div key={request._id} className="border rounded-lg p-3 bg-green-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{request.name}</p>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          {request.requestMessage && (
                            <p className="text-sm text-gray-700 mt-1">"{request.requestMessage}"</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request._id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h5 className="text-lg font-semibold mb-3 text-blue-700">Sent Requests</h5>
              {friendRequests.sent.length === 0 ? (
                <p className="text-gray-600">No sent friend requests</p>
              ) : (
                <div className="space-y-3">
                  {friendRequests.sent.map((request) => (
                    <div key={request._id} className="border rounded-lg p-3 bg-blue-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{request.user.name}</p>
                          <p className="text-sm text-gray-600">{request.user.email}</p>
                          {request.requestMessage && (
                            <p className="text-sm text-gray-700 mt-1">"{request.requestMessage}"</p>
                          )}
                        </div>
                        <span className="text-sm text-blue-600 font-medium">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Popup */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Notifications</h4>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {notifications.length === 0 && upcomingEvents.length === 0 ? (
              <p className="text-gray-600">No notifications yet.</p>
            ) : (
              <div className="space-y-4">
                {notifications.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold mb-3">Activity</h5>
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification._id} className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex items-start gap-3">
                            <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                            <div>
                              <p className="font-semibold text-gray-800">{notification.title}</p>
                              {notification.message && (
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingEvents.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold mb-3">Upcoming Events</h5>
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="border rounded-lg p-3 bg-yellow-50">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getEventIcon(event.type)}</span>
                            <div>
                              <p className="font-semibold text-gray-800">{event.name}</p>
                              <p className="text-sm text-gray-600">{event.type === 'birthday' ? 'Birthday' : event.title}</p>
                              <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()} · {event.daysUntil} days away</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Person Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-bold">Add Person to Circle</h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddPerson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. johndoe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="family">Family</option>
                  <option value="friend">Friend</option>
                  <option value="colleague">Colleague</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Message (Optional)</label>
                <textarea
                  name="requestMessage"
                  value={formData.requestMessage}
                  onChange={handleInputChange}
                  placeholder="Add a personal message with your connection request..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading your circle...</p>
        </div>
      ) : circle.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg mb-4">Your circle is empty</p>
          <p className="text-gray-500">Add friends and family to keep track of their birthdays and important dates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {circle.filter(person => person.status === 'accepted').map((person) => (
            <div key={person._id} className="border rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-lg font-semibold text-gray-800">{person.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs ${getRelationshipColor(person.relationship)}`}>
                  {person.relationship}
                </span>
              </div>

              {person.birthday && (
                <p className="text-sm text-gray-600 mb-1">
                  🎂 {new Date(person.birthday).toLocaleDateString()}
                  <span className="ml-2 font-medium bg-gray-100 rounded px-1">(Age: {calculateAge(person.birthday)})</span>
                </p>
              )}

              {person.anniversary && (
                <p className="text-sm text-gray-600 mb-1">
                  💍 {new Date(person.anniversary).toLocaleDateString()}
                  <span className="ml-2 font-medium bg-pink-50 text-pink-700 rounded px-1">({calculateAnniversary(person.anniversary)})</span>
                </p>
              )}

              {person.email && (
                <p className="text-sm text-gray-600 mb-1">📧 {person.email}</p>
              )}

              {person.phone && (
                <p className="text-sm text-gray-600 mb-1">📱 {person.phone}</p>
              )}

              {person.notes && (
                <p className="text-sm text-gray-600 mb-2">{person.notes}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {person.requester ? (
                  <>
                    <button
                      onClick={() => handleOpenMessage(person)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => handleSendGift(person)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Send Gift
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 px-3 py-1 rounded border border-gray-200">
                    Messaging available for registered friends only
                  </span>
                )}
                <button
                  onClick={() => handleRemovePerson(person._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Unfriend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gift Modal */}
      {giftModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Send Gift to {giftModal.friend?.name}
              </h3>
              <button
                onClick={handleCloseGiftModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Form */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Add Gift Details</h4>
                <form onSubmit={handleSendGiftSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gift Name *</label>
                    <input type="text" value={sendGiftForm.name} onChange={e => setSendGiftForm({...sendGiftForm, name: e.target.value})} required className="w-full px-3 py-2 border rounded" placeholder="E.g. Apple Watch Series 9" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={sendGiftForm.description} onChange={e => setSendGiftForm({...sendGiftForm, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows="2" placeholder="Optional details..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Link</label>
                    <input type="url" value={sendGiftForm.link} onChange={e => setSendGiftForm({...sendGiftForm, link: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="https://..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input type="number" value={sendGiftForm.price} onChange={e => setSendGiftForm({...sendGiftForm, price: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                    <div className="space-y-2 bg-gray-50 p-3 rounded border">
                       <label className="flex items-start">
                         <input type="radio" value="public_to_friends" checked={sendGiftForm.privacy === 'public_to_friends'} onChange={e => setSendGiftForm({...sendGiftForm, privacy: e.target.value})} className="mt-1 mr-2" />
                         <div>
                            <span className="font-medium text-gray-800">Visible to friends and family</span>
                            <p className="text-xs text-gray-500">Helps prevent duplicate gifts. Receiver will NOT see this.</p>
                         </div>
                       </label>
                       <label className="flex items-start mt-2">
                         <input type="radio" value="private_to_sender" checked={sendGiftForm.privacy === 'private_to_sender'} onChange={e => setSendGiftForm({...sendGiftForm, privacy: e.target.value})} className="mt-1 mr-2" />
                         <div>
                           <span className="font-medium text-gray-800">Hide from others</span>
                           <p className="text-xs text-gray-500">Only you can see this gift entry.</p>
                         </div>
                       </label>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition">Send / Log Gift</button>
                </form>
              </div>

              {/* Right Column: Wishlists & Platforms */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Or Select from Wishlists</h4>
                {giftModal.wishlists.length === 0 ? (
                  <p className="text-gray-500 text-sm bg-blue-50 p-3 rounded">No wishlists found. You can browse external platforms or fill custom details manually.</p>
                ) : (
                  <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                    {giftModal.wishlists.map((wishlist) => (
                      <div key={wishlist._id} className="border rounded px-3 py-2">
                        <h5 className="font-semibold text-gray-800">{wishlist.title}</h5>
                        {wishlist.items && wishlist.items.map(item => (
                           <div key={item._id} className="border-t mt-2 pt-2 flex justify-between items-center bg-gray-50 p-2 rounded cursor-pointer hover:bg-indigo-50 border-transparent hover:border-indigo-100 border" onClick={() => handlePrefillGift(item)}>
                             <div>
                               <p className="font-medium text-sm text-gray-800">{item.name}</p>
                               {item.price && <p className="text-xs text-green-600">₹{item.price}</p>}
                             </div>
                             <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded shadow-sm">Select</span>
                           </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                    Browse Platforms
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Amazon', url: 'https://www.amazon.in', color: 'bg-orange-500' },
                      { name: 'Flipkart', url: 'https://www.flipkart.com', color: 'bg-blue-500' },
                      { name: 'Myntra', url: 'https://www.myntra.com', color: 'bg-pink-500' },
                      { name: 'Ajio', url: 'https://www.ajio.com', color: 'bg-purple-500' }
                    ].map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${platform.color} hover:opacity-90 text-white px-3 py-2 rounded text-sm font-medium transition-opacity`}
                      >
                        {platform.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircleSection;