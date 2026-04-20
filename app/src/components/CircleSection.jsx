import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { circleAPI, wishlistAPI, giftAPI } from '../api';
import toast from 'react-hot-toast';
import { Users, Bell, UserPlus, Gift, MessageCircle, Link2, X, Phone, Mail, Calendar, ExternalLink, ImageIcon, Eye, Activity } from 'lucide-react';

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [giftModal, setGiftModal] = useState({ isOpen: false, friend: null, wishlists: [], items: [] });
  
  const [inspectModal, setInspectModal] = useState({ isOpen: false, profile: null, connections: [], loading: false });

  const [formData, setFormData] = useState({
    username: '',
    relationship: 'friend',
    requestMessage: ''
  });

  const [sendGiftForm, setSendGiftForm] = useState({
    name: '',
    description: '',
    link: '',
    imageUrl: '',
    price: '',
    platform: '',
    privacy: 'public_to_friends',
    recipientAddress: '',
    recipientName: ''
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
      toast.error('Failed to fetch your circle.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const response = await circleAPI.getUpcomingEvents();
      setUpcomingEvents(response.data.events || []);
    } catch (err) {
       console.error(err);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await circleAPI.getFriendRequests();
      setFriendRequests(response.data || { received: [], sent: [] });
    } catch (err) {
       console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await circleAPI.getNotifications();
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
       console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    try {
      const response = await circleAPI.addToCircle(formData);
      if (response.data.isRequest) {
        toast.success('Connection request sent!');
        fetchFriendRequests();
      } else {
        fetchCircle();
      }
      setFormData({ username: '', relationship: 'friend', requestMessage: '' });
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add person');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await circleAPI.acceptFriendRequest(requestId);
      toast.success('Connection request accepted!');
      fetchFriendRequests();
      fetchCircle();
      fetchUpcomingEvents();
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await circleAPI.rejectFriendRequest(requestId);
      toast.error('Request rejected');
      fetchFriendRequests();
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemovePerson = async (personId) => {
    if(!window.confirm("Remove this connection?")) return;
    try {
       await circleAPI.removeFromCircle(personId);
       fetchCircle();
       fetchUpcomingEvents();
       toast.success("Person removed");
    } catch {
       toast.error("Failed to remove person");
    }
  }

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      await circleAPI.markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      await circleAPI.markAllNotificationsAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMessage = (friend) => {
    if (!friend.requester) {
      toast.error('You can only message connected friends with registered accounts.');
      return;
    }
    navigate('/messages');
  };

  const handleSendGift = async (friend) => {
    if (!friend.requester) {
      toast.error('You can only send gifts to connected friends with registered accounts.');
      return;
    }
    try {
      const targetUserId = friend.requester._id || friend.requester;
      const [wishlistResponse, profileResponse] = await Promise.all([
        wishlistAPI.getFriendWishlists(targetUserId),
        circleAPI.getFriendProfile(targetUserId)
      ]);
      const friendProfile = profileResponse.data.friend;
      const addressString = friendProfile.address ? `${friendProfile.address.street || ''}, ${friendProfile.address.district || ''}, ${friendProfile.address.state || ''} - ${friendProfile.address.pinCode || ''}`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim() : '';

      setSendGiftForm({
        name: '', description: '', link: '', imageUrl: '', price: '', platform: '', privacy: 'public_to_friends',
        recipientAddress: addressString, recipientName: friendProfile.name
      });

      setGiftModal({ isOpen: true, friend, wishlists: wishlistResponse.data.wishlists || [], items: [] });
    } catch (err) {
      toast.error('Failed to load gift details');
    }
  };

  const handleCloseGiftModal = () => {
    setGiftModal({ isOpen: false, friend: null, wishlists: [], items: [] });
  };

  const handleSendGiftSubmit = async (e) => {
    e.preventDefault();
    if (!giftModal.friend) return;
    try {
      const giftData = {
        receiverFriendId: giftModal.friend._id,
        name: sendGiftForm.name,
        description: sendGiftForm.description,
        link: sendGiftForm.link,
        price: sendGiftForm.price,
        platform: sendGiftForm.platform,
        privacy: sendGiftForm.privacy,
        images: sendGiftForm.imageUrl ? [sendGiftForm.imageUrl] : []
      };
      await giftAPI.sendGift(giftData);
      toast.success('Gift sent successfully!');
      handleCloseGiftModal();
    } catch (err) {
      toast.error('Failed to send gift');
    }
  };

  const handlePrefillGift = (item) => {
    setSendGiftForm({
      ...sendGiftForm,
      name: item.name || '',
      description: item.description || '',
      link: item.productLink || item.link || '',
      imageUrl: item.productImage || '',
      price: item.price || ''
    });
  };

  const handleInspect = async (friend) => {
    if (!friend.requester) {
      toast.error('Can only inspect registered connections.');
      return;
    }
    setInspectModal({ isOpen: true, profile: friend, connections: [], loading: true });
    
    try {
      const targetUserId = friend.requester._id || friend.requester;
      const [profileRes, connRes] = await Promise.all([
         circleAPI.getFriendProfile(targetUserId),
         circleAPI.getFriendConnections(targetUserId)
      ]);
      
      setInspectModal(prev => ({
         isOpen: true,
         profile: { ...prev.profile, ...profileRes.data.friend },
         connections: connRes.data.connections || [],
         loading: false
      }));
    } catch (err) {
      toast.error('Failed to load profile details');
      setInspectModal(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="bg-transparent animate-fade-in transition-all">
      
      {/* Section Header */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden z-10 transition-all hover:shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-10 -mt-20 -mr-20"></div>
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
             <Users size={24} />
           </div>
           <div>
             <h3 className="text-2xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">My Circle</h3>
             <p className="text-gray-500 text-sm font-medium">Connect and celebrate</p>
           </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowRequests(!showRequests)} className="relative flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md">
            <Users size={18} className={showRequests ? 'text-indigo-600' : 'text-orange-500'}/> Requests
             {(friendRequests.received.length + friendRequests.sent.length) > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm animate-bounce">{friendRequests.received.length + friendRequests.sent.length}</span>
             )}
          </button>
          
          <button onClick={() => { setShowNotifications(!showNotifications); if(!showNotifications) fetchNotifications(); }} className="relative flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md">
            <Bell size={18} className={showNotifications ? 'text-yellow-600' : 'text-yellow-500'}/> Alerts
             {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">{unreadCount}</span>
             )}
          </button>
          
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-300">
            <UserPlus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-64 flex flex-col justify-between">
                 <div className="flex justify-between items-start"><div className="w-12 h-12 bg-gray-200 rounded-full"></div><div className="w-16 h-6 bg-gray-200 rounded-full"></div></div>
                 <div className="space-y-3"><div className="w-3/4 h-4 bg-gray-200 rounded"></div><div className="w-1/2 h-4 bg-gray-200 rounded"></div><div className="w-2/3 h-4 bg-gray-200 rounded"></div></div>
                 <div className="flex gap-2"><div className="flex-1 h-10 bg-gray-200 rounded-xl"></div><div className="flex-1 h-10 bg-gray-200 rounded-xl"></div></div>
              </div>
           ))}
        </div>
      ) : circle.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
          <Users size={48} className="text-indigo-200 mb-4" />
          <h4 className="text-xl font-bold text-gray-800 mb-2">Build Your Inner Circle</h4>
          <p className="text-gray-500 mb-6 max-w-sm">Keep track of birthdays, plan gifts, and never miss a special moment for the people who matter most.</p>
          <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">Add your first connection</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circle.filter(p => p.status === 'accepted').map((person, idx) => {
            const hasUpcomingBday = upcomingEvents.some(e => e.id === person._id && e.type === 'birthday');
            const hasUpcomingAnniv = upcomingEvents.some(e => e.id === person._id && e.type === 'anniversary');
            
            return (
              <div key={person._id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 transform hover:-translate-y-1 relative group flex flex-col animate-fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 
                 {/* Header Row */}
                 <div className="flex justify-between items-start mb-5">
                    <div className="flex gap-3 items-center">
                       <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xl uppercase shadow-sm">
                         {person.name.charAt(0)}
                       </div>
                       <div>
                         <h4 className="text-lg font-bold text-gray-900 leading-tight">{person.name}</h4>
                         <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">{person.relationship}</span>
                       </div>
                    </div>
                    {/* Inspect Button */}
                    <button onClick={() => handleInspect(person)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors tooltip" title="Inspect Profile & Connections">
                       <Eye size={18} />
                    </button>
                 </div>

                 {/* Info List */}
                 <div className="space-y-3 mb-6 flex-1">
                    {person.phone && (
                       <div className="flex items-center gap-3 text-sm text-gray-600"><Phone size={14} className="text-gray-400"/> {person.phone}</div>
                    )}
                    {person.email && (
                       <div className="flex items-center gap-3 text-sm text-gray-600 truncate"><Mail size={14} className="text-gray-400"/> <span className="truncate">{person.email}</span></div>
                    )}
                    
                    {person.birthday && (
                      <div className={`flex items-center gap-3 text-sm transition-colors ${hasUpcomingBday ? 'text-yellow-700 font-bold' : 'text-gray-600'}`}>
                         <Calendar size={14} className={hasUpcomingBday ? 'text-yellow-500 animate-pulse' : 'text-gray-400'}/>
                         <div>
                           <span>{new Date(person.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                           <span className="ml-2 text-xs opacity-75">(Age {calculateAge(person.birthday)})</span>
                           {hasUpcomingBday && <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-md font-bold shadow-sm">SOON!</span>}
                         </div>
                      </div>
                    )}

                    {person.anniversary && (
                      <div className={`flex items-center gap-3 text-sm flex-wrap transition-colors ${hasUpcomingAnniv ? 'text-pink-700 font-bold' : 'text-gray-600'}`}>
                         <Calendar size={14} className={hasUpcomingAnniv ? 'text-pink-500 animate-pulse' : 'text-gray-400'}/>
                         <div>
                           <span>{new Date(person.anniversary).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                           <span className="ml-2 text-xs opacity-75">({calculateAnniversary(person.anniversary)})</span>
                           {hasUpcomingAnniv && <span className="ml-2 px-1.5 py-0.5 bg-pink-100 text-pink-800 text-[10px] rounded-md font-bold shadow-sm">SOON!</span>}
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Action Buttons */}
                 <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-50">
                    {person.requester ? (
                      <>
                        <Link to={`/gift-activity/${person._id}`} className="w-full flex justify-center items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl text-sm transition-colors mb-1">
                          <Activity size={14}/> View Gift Activity
                        </Link>
                        <div className="flex gap-2 w-full">
                           <button onClick={() => handleOpenMessage(person)} className="flex-1 flex justify-center items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 font-semibold py-2 rounded-xl text-sm border border-gray-200 transition-all hover:border-gray-300">
                             <MessageCircle size={14}/> Message
                           </button>
                           <button onClick={() => handleSendGift(person)} className="flex-1 flex justify-center items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 text-white font-bold py-2 rounded-xl text-sm shadow-sm transition-all shadow-indigo-200 hover:shadow-md">
                             <Gift size={14}/> Send Gift
                           </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full text-center text-xs text-gray-400 bg-gray-50 py-3 rounded-xl border border-gray-100 font-medium">Unregistered Contact Record</div>
                    )}
                 </div>

                 {/* Remove icon absolute */}
                 <button onClick={() => handleRemovePerson(person._id)} className="absolute top-[80px] right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 hover:border-red-200 hover:bg-red-50" title="Remove Connection">
                   <X size={14} />
                 </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal */}
      {inspectModal.isOpen && (
         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity animate-fade-in" onClick={() => setInspectModal({ isOpen: false, profile: null, connections: [], loading: false })}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col transform transition-transform animate-scale-up" onClick={e=>e.stopPropagation()}>
               <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2"><Eye size={20} className="text-indigo-500"/> Inspect Profile</h3>
                  <button onClick={() => setInspectModal({ isOpen: false, profile: null, connections: [], loading: false })} className="p-2 hover:bg-white rounded-full bg-gray-100 text-gray-500 shadow-sm transition-colors"><X size={18}/></button>
               </div>
               <div className="p-6 max-h-[70vh] overflow-y-auto">
                 {inspectModal.loading ? (
                    <div className="animate-pulse space-y-6">
                      <div className="flex items-center gap-4"><div className="w-16 h-16 bg-gray-200 rounded-full"></div><div><div className="w-32 h-6 bg-gray-200 rounded mb-2"></div><div className="w-24 h-4 bg-gray-200 rounded"></div></div></div>
                      <div className="space-y-3"><div className="w-full h-4 bg-gray-200 rounded"></div><div className="w-3/4 h-4 bg-gray-200 rounded"></div></div>
                    </div>
                 ) : (
                    <div className="space-y-8">
                       {/* Profile Section */}
                       <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-extrabold text-3xl uppercase shadow-md border-4 border-white">
                             {inspectModal.profile?.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-gray-900">{inspectModal.profile?.name}</h4>
                             <p className="text-gray-500 font-medium tracking-wide">@{inspectModal.profile?.username || 'user'}</p>
                             <div className="flex gap-2 mt-2">
                                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase">{inspectModal.profile?.relationship}</span>
                             </div>
                          </div>
                       </div>
                       
                       {/* Connections Section */}
                       <div>
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-bold text-gray-800 flex items-center gap-2"><Users size={18} className="text-gray-400"/> Joint Connections</h5>
                            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">Filtered by: {inspectModal.profile?.relationship} Status</span>
                          </div>
                          
                          {inspectModal.connections.length === 0 ? (
                             <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-500 font-medium">
                               No relevant connections found.
                             </div>
                          ) : (
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {inspectModal.connections.map(c => (
                                   <div key={c._id} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-default">
                                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">{c.requester?.name?.charAt(0) || 'C'}</div>
                                      <div className="overflow-hidden">
                                        <div className="font-bold text-gray-900 text-sm truncate">{c.requester?.name}</div>
                                        <div className="text-xs text-gray-500 truncate">@{c.requester?.username}</div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                 )}
               </div>
            </div>
         </div>
      )}

      {/* Popups... */}
      {showNotifications && (
         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50 p-4 animate-fade-in" onClick={() => setShowNotifications(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-slide-down" onClick={e=>e.stopPropagation()}>
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-extrabold text-xl text-gray-900">Notifications</h3>
                  <button onClick={()=>setShowNotifications(false)} className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-500 transition-colors"><X size={18}/></button>
               </div>
               <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {notifications.length===0 && upcomingEvents.length===0 && <div className="p-8 text-center text-gray-500 font-medium">All caught up!</div>}
                  {upcomingEvents.length > 0 && <div className="p-4"><p className="text-xs font-bold text-yellow-600 uppercase mb-3 tracking-wide">Upcoming Milestones</p>{upcomingEvents.map(event => (<div key={event.id} className="p-3 mb-2 rounded-xl bg-yellow-50 border border-yellow-100 hover:shadow-sm transition-shadow"><div className="font-bold text-gray-800">{event.name} {event.type==='birthday'?'🎂🎈':'💍'}</div><div className="text-sm text-yellow-800">In {event.daysUntil} days ({new Date(event.date).toLocaleDateString()})</div></div>))}</div>}
                  {notifications.length > 0 && <div className="p-4"><p className="text-xs font-bold text-indigo-600 uppercase mb-3 tracking-wide">Recent Activity</p>{notifications.map(n => (<div key={n._id} className={`p-4 mb-2 rounded-xl transition-all ${n.isRead ? 'bg-gray-50 opacity-70' : 'bg-indigo-50 border border-indigo-100'} flex justify-between`}><div className="flex-1"><p className="font-bold text-gray-800 text-sm">{n.title}</p><p className="text-sm text-gray-600 mt-1">{n.message}</p></div>{!n.isRead && <div className="ml-4"><button onClick={()=>handleMarkNotificationAsRead(n._id)} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors">Mark Read</button></div>}</div>))}</div>}
               </div>
            </div>
         </div>
      )}

      {showRequests && (
         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50 p-4 animate-fade-in" onClick={() => setShowRequests(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-slide-down" onClick={e=>e.stopPropagation()}>
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-extrabold text-xl text-gray-900">Network Requests</h3>
                  <button onClick={()=>setShowRequests(false)} className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-500 transition-colors"><X size={18}/></button>
               </div>
               <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {friendRequests.received.length===0 && friendRequests.sent.length===0 && <div className="p-8 text-center text-gray-500 font-medium">No pending requests.</div>}
                  {friendRequests.received.map(r=><div key={r._id} className="p-4 m-2 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"><p className="font-bold text-gray-900">{r.name}</p><p className="text-sm text-gray-500 mb-3">{r.email}</p><div className="flex gap-2"><button onClick={()=>handleAcceptRequest(r._id)} className="bg-indigo-600 text-white font-bold py-2.5 flex-1 rounded-xl shadow shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 transition-all">Accept</button><button onClick={()=>handleRejectRequest(r._id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold py-2 flex-1 rounded-xl transition-colors">Reject</button></div></div>)}
               </div>
            </div>
         </div>
      )}

      {showAddForm && (
         <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in" onClick={() => setShowAddForm(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col animate-scale-up" onClick={e=>e.stopPropagation()}>
               <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-extrabold text-xl text-gray-900">Add New Connection</h3>
                  <button onClick={()=>setShowAddForm(false)} className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-500 transition-colors"><X size={18}/></button>
               </div>
               <form onSubmit={handleAddPerson} className="p-6 space-y-5">
                 <div><label className="font-bold text-gray-700 text-sm ml-1">Username *</label><input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white" placeholder="Target user's sign-in identifier"/></div>
                 <div><label className="font-bold text-gray-700 text-sm ml-1">Relationship</label><select name="relationship" value={formData.relationship} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white font-medium text-gray-700"><option value="friend">Friend</option><option value="family">Family</option><option value="colleague">Colleague</option></select></div>
                 <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5 transition-transform font-bold rounded-xl shadow shadow-indigo-200 py-3.5">Add Connection</button><button type="button" onClick={()=>setShowAddForm(false)} className="px-6 py-3.5 border-2 font-bold rounded-xl text-gray-600 hover:bg-gray-50 border-gray-200 transition-colors">Cancel</button></div>
               </form>
            </div>
         </div>
      )}

      {/* Gift overlay... */}
      {giftModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-center z-[60] p-4 animate-fade-in" onClick={handleCloseGiftModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 animate-scale-up" onClick={e=>e.stopPropagation()}>
             <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
                <h3 className="font-extrabold text-xl text-indigo-900 flex items-center gap-2"><Gift size={20}/> Gift For {giftModal.friend?.name}</h3>
                <button onClick={handleCloseGiftModal} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm transition-colors"><X size={16}/></button>
             </div>
             <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form side */}
                <div className="space-y-4">
                   <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Manual Entry / Custom</h4>
                   <form onSubmit={handleSendGiftSubmit} className="space-y-4">
                      <div><input type="text" value={sendGiftForm.name} onChange={e=>setSendGiftForm({...sendGiftForm, name: e.target.value})} placeholder="Item name..." required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all"/></div>
                      <div className="flex gap-2"><input type="url" placeholder="Paste product link" value={sendGiftForm.link} onChange={e=>setSendGiftForm({...sendGiftForm, link: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-sm"/><input type="url" placeholder="Image URL" value={sendGiftForm.imageUrl} onChange={e=>setSendGiftForm({...sendGiftForm, imageUrl: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all text-sm"/></div>
                      <div>
                        <textarea placeholder="Description or notes" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white outline-none transition-all" rows="2" value={sendGiftForm.description} onChange={e=>setSendGiftForm({...sendGiftForm,description:e.target.value})}></textarea>
                      </div>

                      {/* Platform Select */}
                      <div>
                        <label className="font-bold text-gray-800 text-sm mb-1 block">Platform <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <div className="flex flex-wrap gap-2">
                          {['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Other'].map(p => (
                            <button 
                              key={p} 
                              type="button" 
                              onClick={() => setSendGiftForm({...sendGiftForm, platform: p})}
                              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors shadow-sm ${sendGiftForm.platform === p ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Privacy Custom Add for SendGift */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                         <label className="font-bold text-gray-800 text-sm mb-2 block">Privacy / Visibility</label>
                         <div className="space-y-2">
                           <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-colors">
                              <input type="radio" value="public_to_friends" checked={sendGiftForm.privacy==='public_to_friends'} onChange={e=>setSendGiftForm({...sendGiftForm,privacy:e.target.value})} className="mt-1"/>
                              <div>
                                <div className="font-bold text-sm text-gray-800">Surprise via Friends</div>
                                <div className="text-xs text-gray-500">Visible to network, completely hidden from receiver.</div>
                              </div>
                           </label>
                           <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-colors">
                              <input type="radio" value="private_to_sender" checked={sendGiftForm.privacy==='private_to_sender'} onChange={e=>setSendGiftForm({...sendGiftForm,privacy:e.target.value})} className="mt-1"/>
                              <div>
                                <div className="font-bold text-sm text-gray-800">Personal Memory (Private)</div>
                                <div className="text-xs text-gray-500">Only you can see this log ever.</div>
                              </div>
                           </label>
                         </div>
                      </div>

                      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 shadow-sm shadow-green-200 transition-all hover:-translate-y-0.5"><Gift size={18}/> Log Sent Gift</button>
                   </form>
                </div>
                {/* Pre-fill side */}
                <div className="space-y-4">
                   <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Select from their Wishlists</h4>
                   <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4">
                      {giftModal.wishlists.length === 0 ? (
                         <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl text-center text-blue-600 font-medium text-sm">
                           No wishlists configured globally for this contact.
                         </div>
                      ) : giftModal.wishlists.map(w => (
                         <div key={w._id} className="border border-gray-100 rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                            <h5 className="font-bold text-gray-800 mb-2">{w.title}</h5>
                            {w.items?.map(i => (
                               <div key={i._id} className="p-2 mb-2 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer flex justify-between items-center group transition" onClick={()=>handlePrefillGift(i)}>
                                 <span className="font-medium text-gray-700 group-hover:text-indigo-900 transition-colors text-sm">{i.name}</span>
                                 <span className="bg-white border border-gray-200 px-2 py-1 flex items-center gap-1 text-[10px] rounded-md font-bold text-gray-500 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors"><Link2 size={12}/> Match</span>
                               </div>
                            ))}
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default CircleSection;