/**
 * Dashboard Page Component
 * Main user dashboard showing wishlists, upcoming events, and recent activity
 * Provides navigation to all major features of the application
 */

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { wishlistAPI, circleAPI, giftAPI } from '../api';
import CircleSection from '../components/CircleSection';
import { Gift, Users, Calendar, MessageCircle, Home, LogOut, Activity, Star, Clock, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

// Featured gift suggestions for inspiration
const FEATURED_GIFTS = [
  { id: 1, name: 'Minimalist Watch', price: '$120', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400', category: 'Accessories' },
  { id: 2, name: 'Ceramic Coffee Set', price: '$85', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=400', category: 'Lifestyle' },
  { id: 3, name: 'Wireless Earbuds', price: '$199', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', category: 'Tech' },
];

export default function DashboardPage() {
  // Component state management
  const [activeTab, setActiveTab] = useState('overview'); // Current active tab

  // Data states
  const [wishlists, setWishlists] = useState([]); // User's wishlists
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Upcoming birthdays/anniversaries
  const [recentActivity, setRecentActivity] = useState([]); // Recent gift activity
  const [globalLoading, setGlobalLoading] = useState(true); // Loading state
  const [filterType, setFilterType] = useState('all'); // Event filter type

  // Context and navigation
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  /**
   * Fetches all dashboard data from multiple APIs
   * Loads wishlists, upcoming events, and recent activity in parallel
   */
  const fetchDashboardData = async () => {
    setGlobalLoading(true);
    try {
      // Fetch data from multiple endpoints simultaneously
      const [wlRes, evtRes, actRes] = await Promise.all([
        wishlistAPI.getMyWishlists(), // Get user's wishlists
        circleAPI.getUpcomingEvents(), // Get upcoming events (birthdays/anniversaries)
        giftAPI.getGlobalGiftActivity().catch(() => ({ data: { activity: [] } })) // Get recent gift activity (with fallback)
      ]);

      // Update state with fetched data
      setWishlists(wlRes.data.wishlists || []);
      setUpcomingEvents(evtRes.data.events || []);
      setRecentActivity(actRes.data?.activity || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Some dashboard data failed to load.');
    } finally {
      setGlobalLoading(false);
    }
  };

  /**
   * Deletes a wishlist after user confirmation
   * @param {string} id - Wishlist ID to delete
   */
  const handleDeleteWishlist = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wishlist?')) return;
    try {
      await wishlistAPI.deleteWishlist(id);
      setWishlists(wishlists.filter(w => w._id !== id));
      toast.success('Wishlist deleted');
    } catch (err) {
      toast.error('Failed to delete wishlist');
    }
  };

  /**
   * Handles user logout
   * Clears authentication and redirects to login
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter upcoming events by relationship type
  const filteredEvents = upcomingEvents.filter(e => {
    if (filterType === 'all') return true;
    return e.relationship === filterType;
  });

  /**
   * Renders the overview tab content
   * Shows welcome message, stats, and featured gifts
   */
  const renderOverviewTab = () => (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50">
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-10 -mt-32 -mr-32"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-2xl -z-10 -mb-20 -ml-20"></div>
         <div className="flex flex-col md:flex-row items-center gap-8 mb-4">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/30 backdrop-blur-sm shadow-2xl overflow-hidden shrink-0 transition-transform duration-500 hover:scale-105 cursor-pointer premium-shadow"
              onClick={() => user?.profileImage && navigate('/profile')}
            >
              {user?.profileImage ? (
                 <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover bg-white" />
              ) : (
                 <div className="w-full h-full bg-indigo-500/50 flex items-center justify-center font-black text-4xl uppercase backdrop-blur-md">
                   {user?.name?.charAt(0)}
                 </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Welcome, {user?.name?.split(' ')[0] || 'User'}!</h2>
              <p className="text-indigo-100/80 max-w-xl text-lg font-medium leading-relaxed">Your personal hub for wishlists and meaningful gifting.</p>
            </div>
         </div>
         <div className="mt-8 flex gap-4">
            <button onClick={() => setActiveTab('circle')} className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:translate-y-[-2px] hover:shadow-md transition-all flex items-center gap-2">
               View Network <ArrowRight size={16}/>
            </button>
            <Link to="/create-wishlist" className="bg-indigo-500/30 hover:bg-indigo-500/50 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-bold border border-indigo-400/30 transition-all flex items-center gap-2">
               New Wishlist
            </Link>
         </div>
      </div>

      {/* Recommended Gifts */}
      <div>
         <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star size={24} className="text-yellow-500"/> Featured Gift Ideas</h3>
              <p className="text-gray-500">Curated picks perfect for any occasion.</p>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_GIFTS.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group">
                 <div className="h-48 overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2 py-1 rounded-lg">{item.category}</span>
                 </div>
                 <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                       <span className="font-bold text-indigo-600">{item.price}</span>
                    </div>
                    <button onClick={()=>setActiveTab('circle')} className="w-full mt-4 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 border border-gray-200 hover:border-indigo-200 py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                       <Gift size={16}/> Send to Connection
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Recent Activity */}
      <div>
         <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Activity size={24} className="text-blue-500"/> Recent Gift Activity</h3>
              <p className="text-gray-500">Keep track of what's already being ordered for your friends.</p>
            </div>
         </div>
         <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {recentActivity.length === 0 ? (
               <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                  <Gift size={40} className="text-gray-300 mb-3"/>
                  <span className="font-medium">No recent gift activity in your network.</span>
               </div>
            ) : (
               <div className="divide-y divide-gray-50">
                  {recentActivity
                    .filter(gift => {
                      // Strictly exclude gifts related to self (surprises)
                      const currentUserId = user?._id || user?.id;
                      if (gift.receiverUser === currentUserId || gift.receiverUser?._id === currentUserId) return false;
                      return true;
                    })
                    .slice(0, 10)
                    .map(gift => (
                     <div key={gift._id} className="p-5 hover:bg-gray-50 transition-colors flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-indigo-500 border border-gray-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                           <Gift size={20}/>
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-gray-900 text-base tracking-tight mb-0.5">
                             {gift.name} <span className="text-gray-400 font-medium">ordered to</span> <span className="text-indigo-600">{gift.receiverFriendId?.name || 'Friend'}</span>
                           </p>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              Ordered by <span className="text-indigo-600">{gift.sender?.name || 'Someone'}</span>
                              {gift.platform && (
                                <>
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span>via <span className="text-gray-600">{gift.platform}</span></span>
                                </>
                              )}
                           </p>
                        </div>
                        <div className="text-right shrink-0">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(gift.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</p>
                           <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-lg border border-green-100 uppercase tracking-tighter">Sent</span>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );

  const renderMyGiftsTab = () => (
    <div className="animate-fade-in space-y-8">
       <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
         <div>
           <h2 className="text-3xl font-extrabold text-gray-900">My Wishlists</h2>
           <p className="text-gray-500">Manage and share your personal registries.</p>
         </div>
         <Link to="/create-wishlist" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2">
            <Gift size={18}/> Create New
         </Link>
       </div>

       {wishlists.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center">
             <Gift size={64} className="text-indigo-100 mb-4"/>
             <h3 className="text-xl font-bold text-gray-800 mb-2">No wishlists yet</h3>
             <p className="text-gray-500 mb-6 max-w-md">Create your first wishlist to share your ideas with friends and family.</p>
             <Link to="/create-wishlist" className="bg-indigo-50 text-indigo-700 font-bold px-6 py-3 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">Get Started</Link>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(wishlists || []).map((wl) => (
              <div key={wl._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{wl.title}</h3>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${wl.visibility === 'public' ? 'bg-green-50 border-green-200 text-green-700' : wl.visibility === 'connections' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                     {wl.visibility}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">{wl.description || 'No description provided.'}</p>
                
                {wl.visibility === 'public' && (
                  <div className="mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-1">Public Link</p>
                    <div className="flex gap-2">
                       <input type="text" readOnly value={`${window.location.origin}/wishlist/${wl.publicLink}`} className="text-xs bg-white border border-gray-200 rounded px-2 py-1.5 flex-1 truncate text-gray-600 outline-none"/>
                       <button onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}/wishlist/${wl.publicLink}`); toast.success('Copied!')}} className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold transition-colors">Copy</button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/wishlist/${wl._id}`} className="flex-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-gray-700 border border-gray-200 py-2 rounded-xl text-center font-bold transition-all text-sm">
                    View & Edit
                  </Link>
                  <button onClick={() => handleDeleteWishlist(wl._id)} className="px-4 bg-white border border-red-100 text-red-500 hover:bg-red-50 py-2 rounded-xl text-center font-bold transition-all text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
       )}
    </div>
  );

  const renderOccasionsTab = () => (
    <div className="animate-fade-in space-y-8">
       <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-8 z-10">
         <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
           <div>
             <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2"><Clock className="text-indigo-500" size={28}/> Upcoming Occasions</h2>
             <p className="text-gray-500">Track birthdays and anniversaries effortlessly.</p>
           </div>
           
           {/* Filters */}
           <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 overflow-x-auto w-full sm:w-auto">
             {['all', 'friend', 'family', 'colleague'].map(f => (
               <button 
                 key={f} 
                 onClick={()=>setFilterType(f)} 
                 className={`px-4 py-2 text-sm font-bold rounded-lg capitalize whitespace-nowrap transition-all ${filterType===f ? 'bg-white shadow-sm text-indigo-700 border border-gray-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
               >
                 {f}
               </button>
             ))}
           </div>
         </div>
       </div>

       <div className="max-w-4xl mx-auto py-8 px-4 relative">
          {filteredEvents.length === 0 ? (
             <div className="text-center py-20">
                <Calendar size={64} className="text-gray-200 mx-auto mb-4"/>
                <p className="text-xl font-bold text-gray-400">No upcoming events found</p>
             </div>
          ) : (
             <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-indigo-100 before:via-purple-100 before:to-transparent">
               {(filteredEvents || []).map((evt, idx) => (
                 <div key={`${evt.id}-${evt.type}`} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-12 animate-fade-in`} style={{animationDelay: `${idx*100}ms`}}>
                    {/* Timeline Dot */}
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-indigo-500 text-white shadow-md absolute left-0 md:left-1/2 -translate-x-1/2 shrink-0 z-10 transition-transform group-hover:scale-125">
                       {evt.type === 'birthday' ? <Gift size={16}/> : <Star size={16}/>}
                    </div>

                    {/* Content Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] pl-4 md:pl-0">
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group-hover:-translate-y-1 transform duration-300">
                          {/* Inner badge */}
                          <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-xs font-bold text-white ${evt.daysUntil <= 7 ? 'bg-red-500' : 'bg-indigo-500'}`}>
                             {evt.daysUntil === 0 ? 'TODAY!' : `In ${evt.daysUntil} days`}
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-extrabold text-xl flex items-center justify-center uppercase shadow-inner">
                                {evt.name.charAt(0)}
                             </div>
                             <div>
                                <h4 className="text-xl font-bold text-gray-900">{evt.name}</h4>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full uppercase truncate">{evt.relationship}</span>
                             </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                             <div className="text-sm text-gray-600 mb-1 flex justify-between">
                                <span className="font-medium">{evt.type === 'birthday' ? 'Birthday' : 'Anniversary'}</span>
                                <span className="font-bold text-gray-900">{new Date(evt.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                             </div>
                          </div>
 
                          <button onClick={()=>setActiveTab('circle')} className="w-full mt-4 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold py-2 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                             Send Gift Now <ChevronRight size={14}/>
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex overflow-hidden">
       {/* Collapsible Sidebar Overlay for mobile (hidden by default) */}
       {/* Sidebar */}
       <aside className="w-64 bg-white border-r border-gray-100 shadow-sm flex-shrink-0 hidden lg:flex flex-col sticky top-0 h-screen z-20">
          <div className="p-6 pb-2">
             <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">GiftRegistry</h1>
          </div>
          
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
             <div className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-2">Menu</div>
             
             {[
               { id: 'overview', label: 'Overview', icon: Home },
               { id: 'my-gifts', label: 'My Wishlists', icon: Gift },
               { id: 'occasions', label: 'Occasions', icon: Calendar },
               { id: 'circle', label: 'My Circle', icon: Users },
             ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all group ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}/> 
                  {item.label}
                </button>
             ))}

             <Link to="/messages" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all group text-gray-500 hover:bg-gray-50 hover:text-gray-900">
                <MessageCircle size={20} className="text-gray-400 group-hover:text-gray-600"/> Messages
             </Link>
          </nav>

          <div className="p-4 mt-auto border-t border-gray-50">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={20}/> Logout
             </button>
          </div>
       </aside>

       {/* Mobile Nav Header */}
       <div className="lg:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between p-4 shadow-sm">
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">GiftRegistry</h1>
          {/* Extremely basic mobile switcher for brevity */}
          <select 
             className="bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg font-bold outline-none p-2"
             value={activeTab}
             onChange={(e) => setActiveTab(e.target.value)}
          >
             <option value="overview">Overview</option>
             <option value="my-gifts">My Wishlists</option>
             <option value="occasions">Occasions</option>
             <option value="circle">My Circle</option>
          </select>
       </div>

       {/* Main Content Pane */}
       <main className="flex-1 overflow-y-auto w-full relative pt-20 lg:pt-0">
          <div className="max-w-6xl mx-auto p-4 md:p-8 pb-32 lg:pb-8 relative">
             {globalLoading ? (
                <div className="animate-pulse space-y-8">
                   <div className="h-64 bg-white rounded-3xl w-full border border-gray-100"></div>
                   <div className="flex gap-4"><div className="h-48 flex-1 bg-white rounded-3xl border border-gray-100"></div><div className="h-48 flex-1 bg-white rounded-3xl border border-gray-100"></div></div>
                </div>
             ) : (
                <>
                   {activeTab === 'overview' && renderOverviewTab()}
                   {activeTab === 'my-gifts' && renderMyGiftsTab()}
                   {activeTab === 'occasions' && renderOccasionsTab()}
                   
                   <div style={{ display: activeTab === 'circle' ? 'block' : 'none' }}>
                      <CircleSection />
                   </div>
                </>
             )}
          </div>
       </main>
       
       <style>{`
         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
         ::-webkit-scrollbar { width: 8px; }
         ::-webkit-scrollbar-track { background: transparent; }
         ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
         ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
       `}</style>
    </div>
  );
}
