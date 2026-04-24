/**
 * CircleSection Component
 * Manages user's social connections (friends/family circle)
 * Handles friend requests, notifications, upcoming events, and gift sending
 */

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { circleAPI, wishlistAPI, giftAPI, itemAPI, adminAPI } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import toast from "react-hot-toast";
import {
  Users,
  Bell,
  UserPlus,
  Gift,
  MessageCircle,
  Link2,
  X,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  ImageIcon,
  Eye,
  Activity,
  ShoppingCart,
  Lock,
  Info,
  ChevronDown,
  Plus,
  Circle,
  CheckCircle2,
  MessageSquare,
  Heart,
} from "lucide-react";

/**
 * Calculates age from date of birth string
 * @param {string} dateString - Date of birth in string format
 * @returns {number|null} Age in years or null if invalid
 */
const calculateAge = (dateString) => {
  if (!dateString) return null;
  const dob = new Date(dateString);
  const diff_ms = Date.now() - dob.getTime();
  const age_dt = new Date(diff_ms);
  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

/**
 * Converts number to ordinal format (1st, 2nd, 3rd, etc.)
 * @param {number} n - Number to convert
 * @returns {string} Number with ordinal suffix
 */
const getOrdinal = (n) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/**
 * Calculates anniversary from date string
 * @param {string} dateString - Anniversary date in string format
 * @returns {string|null} Formatted anniversary string or null if invalid
 */
const calculateAnniversary = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const diff_ms = Date.now() - date.getTime();
  const dt = new Date(diff_ms);
  const years = Math.abs(dt.getUTCFullYear() - 1970);
  return getOrdinal(years) + " Anniversary";
};

const PLATFORM_LOGOS = {
  Amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  Flipkart:
    "https://upload.wikimedia.org/wikipedia/commons/7/71/The_Flipkart_Logo_-_from_Official_Website.png",
  Myntra:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/65c5da9f878952603e370d03_Myntra-Logo_1.svg/500px-65c5da9f878952603e370d03_Myntra-Logo_1.svg.png",
  Ajio: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqB3dZdEQOvkLBykZdm_mXnbIfcVOcrvZNvg&s",
};

const CircleSection = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdminUser = user?.role === "admin";

  // Main data states
  const [circle, setCircle] = useState([]); // User's social connections
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Upcoming birthdays/anniversaries
  const [friendRequests, setFriendRequests] = useState({
    received: [],
    sent: [],
  }); // Friend requests
  const [notifications, setNotifications] = useState([]); // User notifications
  const [unreadCount, setUnreadCount] = useState(0); // Unread notification count
  const [loading, setLoading] = useState(true); // Loading state

  // Modal states
  const [showAddForm, setShowAddForm] = useState(false); // Add friend form modal
  const [showNotifications, setShowNotifications] = useState(false); // Notifications modal
  const [showRequests, setShowRequests] = useState(false); // Friend requests modal
  const [giftModal, setGiftModal] = useState({
    isOpen: false,
    friend: null,
    wishlists: [],
    items: [],
    selectedWishlistId: null,
  }); // Gift sending modal

  // Additional modals
  const [inspectModal, setInspectModal] = useState({
    isOpen: false,
    profile: null,
    connections: [],
    loading: false,
  }); // Profile inspection modal
  const [imageModal, setImageModal] = useState({ isOpen: false, src: null }); // Image viewing modal

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    relationship: "friend",
    requestMessage: "",
  });

  // Gift sending form state
  const [sendGiftForm, setSendGiftForm] = useState({
    name: "",
    description: "",
    link: "",
    imageUrl: "",
    price: "",
    platform: "",
    privacy: "public_to_friends",
    recipientAddress: "",
    recipientName: "",
  });

  // Fetch all circle-related data on component mount
  useEffect(() => {
    fetchCircle();
    fetchUpcomingEvents();
    fetchFriendRequests();
    fetchNotifications();
  }, []);

  /**
   * Fetches user's social circle (friends and family connections)
   */
  const fetchCircle = async () => {
    setLoading(true);
    try {
      const response = await circleAPI.getMyCircle();
      setCircle(response.data.circles);
    } catch (err) {
      toast.error("Failed to fetch your circle.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches upcoming events (birthdays and anniversaries)
   */
  const fetchUpcomingEvents = async () => {
    try {
      const response = await circleAPI.getUpcomingEvents();
      setUpcomingEvents(response.data.events || []);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Fetches friend requests (both sent and received)
   */
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    try {
      // Check if target is admin (optional, better handled on backend but good for UX)
      const response = await circleAPI.addToCircle(formData);
      if (response.data.isRequest) {
        toast.success("Connection request sent!");
        fetchFriendRequests();
      } else {
        fetchCircle();
      }
      setFormData({ username: "", relationship: "friend", requestMessage: "" });
      setShowAddForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add person");
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await circleAPI.acceptFriendRequest(requestId);
      toast.success("Connection request accepted!");
      fetchFriendRequests();
      fetchCircle();
      fetchUpcomingEvents();
      fetchNotifications();
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await circleAPI.rejectFriendRequest(requestId);
      toast.error("Request rejected");
      fetchFriendRequests();
    } catch (err) {
      toast.error("Failed to reject request");
    }
  };

  const handleRemovePerson = async (personId) => {
    if (!window.confirm("Remove this connection?")) return;
    try {
      await circleAPI.removeFromCircle(personId);
      fetchCircle();
      fetchUpcomingEvents();
      toast.success("Person removed");
    } catch {
      toast.error("Failed to remove person");
    }
  };

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
      toast.error(
        "You can only message connected friends with registered accounts.",
      );
      return;
    }
    navigate("/messages");
  };

  const handleSendGift = async (friend) => {
    if (!friend.requester) {
      toast.error(
        "You can only send gifts to connected friends with registered accounts.",
      );
      return;
    }
    try {
      const targetUserId = friend.requester._id || friend.requester;
      const [wishlistResponse, profileResponse] = await Promise.all([
        wishlistAPI.getFriendWishlists(targetUserId),
        circleAPI.getFriendProfile(targetUserId),
      ]);
      const friendProfile = profileResponse.data.friend;
      const addressString = friendProfile.address
        ? `${friendProfile.address.street || ""}, ${friendProfile.address.district || ""}, ${friendProfile.address.state || ""} - ${friendProfile.address.pinCode || ""}`
            .replace(/^,\s*|,\s*$|,\s*,/g, "")
            .trim()
        : "";

      setSendGiftForm({
        name: "",
        description: "",
        link: "",
        imageUrl: "",
        price: "",
        platform: "",
        privacy: "public_to_friends",
        recipientAddress: addressString,
        recipientName: friendProfile.name,
      });

      // Fetch items for all wishlists and attach wishlist info
      const wishlists = wishlistResponse.data.wishlists || [];
      const allItems = [];
      for (const wishlist of wishlists) {
        try {
          const itemsResponse = await itemAPI.getItems(wishlist._id);
          const itemsWithWishlistInfo = (itemsResponse.data.items || []).map(
            (item) => ({
              ...item,
              wishlistId: wishlist._id,
              wishlistTitle: wishlist.title,
            }),
          );
          allItems.push(...itemsWithWishlistInfo);
        } catch (err) {
          console.error("Failed to load items for wishlist:", err);
        }
      }

      setGiftModal({
        isOpen: true,
        friend,
        wishlists,
        items: allItems,
        selectedWishlistId: null,
      });
    } catch (err) {
      toast.error("Failed to load gift details");
    }
  };

  const handleCloseGiftModal = () => {
    setGiftModal({
      isOpen: false,
      friend: null,
      wishlists: [],
      items: [],
      selectedWishlistId: null,
    });
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
        images: sendGiftForm.imageUrl ? [sendGiftForm.imageUrl] : [],
      };
      await giftAPI.sendGift(giftData);
      toast.success("Gift sent successfully!");
      handleCloseGiftModal();
    } catch (err) {
      toast.error("Failed to send gift");
    }
  };

  const handlePrefillGift = (item) => {
    setSendGiftForm({
      ...sendGiftForm,
      name: item.name || "",
      description: item.description || "",
      link: item.productLink || item.link || "",
      imageUrl: item.productImage || "",
      price: item.price || "",
    });
  };

  const handleAdminDeleteUser = async (userId) => {
    if (
      window.confirm(
        "ADMIN ACTION: Are you sure you want to delete this user and ALL their data? This cannot be undone.",
      )
    ) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success("User deleted by admin");
        fetchCircle();
      } catch (err) {
        toast.error("Admin deletion failed");
      }
    }
  };

  const handleInspect = async (friend) => {
    if (!friend.requester) {
      toast.error("Can only inspect registered connections.");
      return;
    }
    setInspectModal({
      isOpen: true,
      profile: friend,
      connections: [],
      loading: true,
    });

    try {
      const targetUserId = friend.requester._id || friend.requester;
      const [profileRes, connRes] = await Promise.all([
        circleAPI.getFriendProfile(targetUserId),
        circleAPI.getFriendConnections(targetUserId),
      ]);

      setInspectModal((prev) => ({
        isOpen: true,
        profile: { ...prev.profile, ...profileRes.data.friend },
        connections: connRes.data.connections || [],
        loading: false,
      }));
    } catch (err) {
      toast.error("Failed to load profile details");
      setInspectModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="bg-transparent animate-fade-in transition-all">
      {giftModal.isOpen ? (
        <div className="bg-[#f5f7fb] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-7xl mx-auto overflow-hidden border border-white flex flex-col animate-scale-in relative min-h-[80vh]">
          {/* Content Area - Two Column Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left Column: Manual Entry (60%) */}
            <div className="lg:col-span-7 p-8 lg:p-12 bg-white border-r border-gray-100 flex flex-col space-y-10 overflow-y-auto">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-inner shrink-0">
                  <Gift size={40} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-black text-3xl text-gray-900 tracking-tight">
                    Gift For {giftModal.friend?.name || "Friend"}
                  </h3>
                  <p className="text-gray-500 font-medium text-base mt-1">
                    Fill in the details below to log a new gift for your
                    connection.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 bg-indigo-600 rounded-full"></div>
                  <h4 className="font-bold text-gray-900 text-xl">
                    Manual Entry
                  </h4>
                </div>

                <form onSubmit={handleSendGiftSubmit} className="space-y-6">
                  {/* Item Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Product Name *
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <Gift size={20} />
                      </span>
                      <input
                        type="text"
                        value={sendGiftForm.name}
                        onChange={(e) =>
                          setSendGiftForm({
                            ...sendGiftForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="What are you gifting?"
                        required
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-semibold text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Links Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Product Link
                      </label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <Link2 size={20} />
                        </span>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={sendGiftForm.link}
                          onChange={(e) =>
                            setSendGiftForm({
                              ...sendGiftForm,
                              link: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">
                        Image URL
                      </label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                          <ImageIcon size={20} />
                        </span>
                        <input
                          type="url"
                          placeholder="Image link..."
                          value={sendGiftForm.imageUrl}
                          onChange={(e) =>
                            setSendGiftForm({
                              ...sendGiftForm,
                              imageUrl: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Description / Notes
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                        <MessageSquare size={20} />
                      </span>
                      <textarea
                        placeholder="Add some details about the gift..."
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[120px] resize-none"
                        rows="3"
                        value={sendGiftForm.description}
                        onChange={(e) =>
                          setSendGiftForm({
                            ...sendGiftForm,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                  </div>

                  {/* Sync Choice / Platform */}
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                      Select Platform <Info size={14} className="opacity-50" />
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {["Amazon", "Flipkart", "Myntra", "Ajio", "Other"].map(
                        (p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() =>
                              setSendGiftForm({ ...sendGiftForm, platform: p })
                            }
                            className={`flex items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 w-24 h-24 ${sendGiftForm.platform === p ? "bg-indigo-50 border-indigo-600 shadow-md" : "bg-white border-gray-100 hover:border-indigo-200 hover:bg-gray-50"}`}
                            title={p}
                          >
                            {PLATFORM_LOGOS[p] ? (
                              <img
                                src={PLATFORM_LOGOS[p]}
                                alt={p}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="font-bold text-gray-400">
                                {p}
                              </span>
                            )}
                          </button>
                        ),
                      )}
                    </div>
                    {sendGiftForm.platform === "Other" && (
                      <input
                        type="text"
                        placeholder="Enter platform name..."
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all mt-2 animate-fade-in"
                        onChange={(e) =>
                          setSendGiftForm({
                            ...sendGiftForm,
                            platform: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Shopping & Privacy (40%) */}
            <div className="lg:col-span-5 p-8 lg:p-12 flex flex-col space-y-12 overflow-y-auto">
              {/* Receiver's Wishlist Items */}
              <div className="space-y-6 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-pink-500 shadow-sm border border-gray-50">
                      <Heart size={20} fill="currentColor" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-xl tracking-tight">
                      From Their Wishlist
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                    {giftModal.items?.length || 0} Items
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin max-h-[300px]">
                  {giftModal.items && giftModal.items.length > 0 ? (
                    giftModal.items.map((item, idx) => (
                      <button
                        key={item._id || idx}
                        onClick={() => {
                          handlePrefillGift(item);
                          toast.success("Details copied from wishlist!");
                        }}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex gap-4 group ${sendGiftForm.name === item.name ? "bg-indigo-50 border-indigo-500 shadow-md" : "bg-white border-gray-50 hover:border-indigo-200"}`}
                      >
                        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-indigo-600 mt-0.5">
                            ₹{item.price || "N/A"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest truncate">
                            {item.wishlistTitle || "Wishlist"}
                          </p>
                        </div>
                        <div
                          className={`self-center p-2 rounded-full transition-all ${sendGiftForm.name === item.name ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-300 group-hover:text-indigo-500"}`}
                        >
                          <Plus size={16} strokeWidth={3} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                      <Heart size={40} className="text-gray-200 mb-3" />
                      <p className="text-sm font-bold text-gray-400">
                        Their wishlist is empty.
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                        Fill in the details manually
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shopping Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50">
                    <ShoppingCart size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">
                    Shop Online
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Amazon", url: "https://www.amazon.in" },
                    { name: "Flipkart", url: "https://www.flipkart.com" },
                    { name: "Myntra", url: "https://www.myntra.com" },
                    { name: "Ajio", url: "https://www.ajio.com" },
                  ].map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-gray-100 rounded-3xl hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                    >
                      <div className="h-10 flex items-center justify-center">
                        <img
                          src={PLATFORM_LOGOS[site.name]}
                          alt={site.name}
                          className="h-full w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600">
                        {site.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Privacy Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-50">
                    <Lock size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl tracking-tight">
                    Privacy / Visibility
                  </h4>
                </div>
                <div className="space-y-4">
                  <label
                    className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative ${sendGiftForm.privacy === "public_to_friends" ? "bg-white border-indigo-600 shadow-lg shadow-indigo-500/5" : "bg-gray-50/50 border-gray-100 hover:border-indigo-200"}`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="public_to_friends"
                      checked={sendGiftForm.privacy === "public_to_friends"}
                      onChange={(e) =>
                        setSendGiftForm({
                          ...sendGiftForm,
                          privacy: e.target.value,
                        })
                      }
                      className="hidden"
                    />
                    <div
                      className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 ${sendGiftForm.privacy === "public_to_friends" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border border-gray-100 text-gray-400"}`}
                    >
                      <Users size={24} />
                    </div>
                    <div className="flex-1 pr-6">
                      <p
                        className={`font-black text-base ${sendGiftForm.privacy === "public_to_friends" ? "text-gray-900" : "text-gray-700"}`}
                      >
                        Surprise via Friends
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                        Visible to network, hidden from receiver.
                      </p>
                    </div>
                    {sendGiftForm.privacy === "public_to_friends" && (
                      <CheckCircle2
                        size={24}
                        className="absolute top-5 right-5 text-indigo-600"
                      />
                    )}
                  </label>

                  <label
                    className={`flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer relative ${sendGiftForm.privacy === "private_to_sender" ? "bg-white border-indigo-600 shadow-lg shadow-indigo-500/5" : "bg-gray-50/50 border-gray-100 hover:border-indigo-200"}`}
                  >
                    <input
                      type="radio"
                      name="privacy"
                      value="private_to_sender"
                      checked={sendGiftForm.privacy === "private_to_sender"}
                      onChange={(e) =>
                        setSendGiftForm({
                          ...sendGiftForm,
                          privacy: e.target.value,
                        })
                      }
                      className="hidden"
                    />
                    <div
                      className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 ${sendGiftForm.privacy === "private_to_sender" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white border border-gray-100 text-gray-400"}`}
                    >
                      <Lock size={24} />
                    </div>
                    <div className="flex-1 pr-6">
                      <p
                        className={`font-black text-base ${sendGiftForm.privacy === "private_to_sender" ? "text-gray-900" : "text-gray-700"}`}
                      >
                        Personal Memory
                      </p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                        Only you can see this log ever.
                      </p>
                    </div>
                    {sendGiftForm.privacy === "private_to_sender" && (
                      <CheckCircle2
                        size={24}
                        className="absolute top-5 right-5 text-indigo-600"
                      />
                    )}
                  </label>
                </div>
              </div>

              {/* Privacy Section */}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-12 py-8 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 z-10">
            <div className="flex items-center gap-4 text-indigo-600 font-bold text-sm bg-indigo-50 pl-5 pr-7 py-4 rounded-[1.5rem] border border-indigo-100 shadow-sm animate-fade-in">
              <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
              Your data is encrypted and saved securely in your registry.
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCloseGiftModal}
                className="flex-1 sm:flex-none px-10 py-4 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500 font-black rounded-2xl transition-all shadow-sm active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendGiftSubmit}
                className="flex-1 sm:flex-none px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 transition-all transform active:scale-95"
              >
                <Plus size={22} strokeWidth={3} />
                Add to Circle
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Section Header */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden z-10 transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-full blur-3xl -z-10 -mt-20 -mr-20"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shadow-inner">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  My Circle
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Connect and celebrate
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="relative flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Users
                  size={18}
                  className={
                    showRequests ? "text-indigo-600" : "text-orange-500"
                  }
                />{" "}
                Requests
                {friendRequests.received.length + friendRequests.sent.length >
                  0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                    {friendRequests.received.length +
                      friendRequests.sent.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-700 px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <Bell
                  size={18}
                  className={
                    showNotifications ? "text-yellow-600" : "text-yellow-500"
                  }
                />{" "}
                Alerts
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gray-300"
              >
                <UserPlus size={18} /> Add
              </button>
            </div>
          </div>

          {/* Main Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-64 flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : circle.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px] animate-fade-in">
              <Users size={48} className="text-indigo-200 mb-4" />
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                Build Your Inner Circle
              </h4>
              <p className="text-gray-500 mb-6 max-w-sm">
                Keep track of birthdays, plan gifts, and never miss a special
                moment for the people who matter most.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                Add your first connection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(circle || [])
                .filter((p) => p.status === "accepted")
                .map((person, idx) => {
                  const hasUpcomingBday = (upcomingEvents || []).some(
                    (e) => e.id === person._id && e.type === "birthday",
                  );
                  const hasUpcomingAnniv = (upcomingEvents || []).some(
                    (e) => e.id === person._id && e.type === "anniversary",
                  );

                  return (
                    <div
                      key={person._id}
                      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 premium-shadow-hover transition-all duration-300 transform relative group flex flex-col animate-scale-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Header Row */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex gap-3 items-center">
                          <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-xl uppercase shadow-sm overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() =>
                              person.requester?.profileImage &&
                              setImageModal({
                                isOpen: true,
                                src: person.requester.profileImage,
                              })
                            }
                          >
                            {person.requester &&
                            person.requester.profileImage ? (
                              <img
                                src={person.requester.profileImage}
                                alt={person.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              person.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 leading-tight">
                              {person.name}
                            </h4>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                              {person.relationship}
                            </span>
                          </div>
                        </div>
                        {/* Inspect Button */}
                        <button
                          onClick={() => handleInspect(person)}
                          className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors tooltip"
                          title="Inspect Profile & Connections"
                        >
                          <Eye size={18} />
                        </button>
                      </div>

                      {/* Info List */}
                      <div className="space-y-3 mb-6 flex-1">
                        {person.phone && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />{" "}
                            {person.phone}
                          </div>
                        )}
                        {person.email && (
                          <div className="flex items-center gap-3 text-sm text-gray-600 truncate">
                            <Mail size={14} className="text-gray-400" />{" "}
                            <span className="truncate">{person.email}</span>
                          </div>
                        )}

                        {person.birthday && (
                          <div
                            className={`flex items-center gap-3 text-sm transition-colors ${hasUpcomingBday ? "text-yellow-700 font-bold" : "text-gray-600"}`}
                          >
                            <Calendar
                              size={14}
                              className={
                                hasUpcomingBday
                                  ? "text-yellow-500 animate-pulse"
                                  : "text-gray-400"
                              }
                            />
                            <div>
                              <span>
                                {new Date(person.birthday).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                              <span className="ml-2 text-xs opacity-75">
                                (Age {calculateAge(person.birthday)})
                              </span>
                              {hasUpcomingBday && (
                                <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] rounded-md font-bold shadow-sm">
                                  SOON!
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {person.anniversary && (
                          <div
                            className={`flex items-center gap-3 text-sm flex-wrap transition-colors ${hasUpcomingAnniv ? "text-pink-700 font-bold" : "text-gray-600"}`}
                          >
                            <Calendar
                              size={14}
                              className={
                                hasUpcomingAnniv
                                  ? "text-pink-500 animate-pulse"
                                  : "text-gray-400"
                              }
                            />
                            <div>
                              <span>
                                {new Date(
                                  person.anniversary,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="ml-2 text-xs opacity-75">
                                ({calculateAnniversary(person.anniversary)})
                              </span>
                              {hasUpcomingAnniv && (
                                <span className="ml-2 px-1.5 py-0.5 bg-pink-100 text-pink-800 text-[10px] rounded-md font-bold shadow-sm">
                                  SOON!
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-50">
                        <Link
                          to={`/gift-activity/${person.requester?._id || person._id}`}
                          className="w-full flex justify-center items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl text-sm transition-colors mb-1"
                        >
                          <Activity size={14} /> View Gift Activity
                        </Link>

                        {person.requester ? (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleOpenMessage(person)}
                              className="flex-1 flex justify-center items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 font-semibold py-2 rounded-xl text-sm border border-gray-200 transition-all hover:border-gray-300"
                            >
                              <MessageCircle size={14} /> Message
                            </button>
                            <button
                              onClick={() => handleSendGift(person)}
                              className="flex-1 flex justify-center items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 text-white font-bold py-2 rounded-xl text-sm shadow-sm transition-all shadow-indigo-200 hover:shadow-md"
                            >
                              <Gift size={14} /> Send Gift
                            </button>
                          </div>
                        ) : (
                          <div className="w-full text-center text-[10px] text-gray-400 bg-gray-50/50 py-2 rounded-lg border border-dashed border-gray-100 font-medium uppercase tracking-widest">
                            Unregistered Profile
                          </div>
                        )}
                      </div>

                      {/* Admin Delete button */}
                      {isAdminUser && (
                        <button
                          onClick={() =>
                            handleAdminDeleteUser(
                              person.requester?._id || person._id,
                            )
                          }
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-white rounded-full p-2 shadow-sm border border-red-100 transition-all opacity-0 group-hover:opacity-100 hover:bg-red-50"
                          title="Admin: Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {/* Remove icon absolute */}
                      <button
                        onClick={() => handleRemovePerson(person._id)}
                        className="absolute top-[80px] right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 hover:border-red-200 hover:bg-red-50"
                        title="Remove Connection"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Inspect Modal */}
          {inspectModal.isOpen && (
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity animate-fade-in"
              onClick={() =>
                setInspectModal({
                  isOpen: false,
                  profile: null,
                  connections: [],
                  loading: false,
                })
              }
            >
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col transform transition-transform animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">
                    <Eye size={20} className="text-indigo-500" /> Inspect
                    Profile
                  </h3>
                  <button
                    onClick={() =>
                      setInspectModal({
                        isOpen: false,
                        profile: null,
                        connections: [],
                        loading: false,
                      })
                    }
                    className="p-2 hover:bg-white rounded-full bg-gray-100 text-gray-500 shadow-sm transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {inspectModal.loading ? (
                    <div className="animate-pulse space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="w-32 h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="w-24 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="w-full h-4 bg-gray-200 rounded"></div>
                        <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Profile Section */}
                      <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                        <div
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-extrabold text-3xl uppercase shadow-md border-4 border-white overflow-hidden shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            inspectModal.profile?.profileImage &&
                            setImageModal({
                              isOpen: true,
                              src: inspectModal.profile.profileImage,
                            })
                          }
                        >
                          {inspectModal.profile?.profileImage ? (
                            <img
                              src={inspectModal.profile.profileImage}
                              alt={inspectModal.profile.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            inspectModal.profile?.name?.charAt(0) || "U"
                          )}
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-gray-900">
                            {inspectModal.profile?.name}
                          </h4>
                          <p className="text-gray-500 font-medium tracking-wide">
                            @{inspectModal.profile?.username || "user"}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md uppercase">
                              {inspectModal.profile?.relationship}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Connections Section */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-bold text-gray-800 flex items-center gap-2">
                            <Users size={18} className="text-gray-400" /> Joint
                            Connections
                          </h5>
                          <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            Filtered by: {inspectModal.profile?.relationship}{" "}
                            Status
                          </span>
                        </div>

                        {!inspectModal.connections ||
                        inspectModal.connections.length === 0 ? (
                          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center text-gray-500 font-medium">
                            No relevant connections found.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {inspectModal.connections.map((c) => (
                              <div
                                key={c._id}
                                className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 bg-white hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-default"
                              >
                                <div
                                  className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() =>
                                    c.requester?.profileImage &&
                                    setImageModal({
                                      isOpen: true,
                                      src: c.requester.profileImage,
                                    })
                                  }
                                >
                                  {c.requester?.profileImage ? (
                                    <img
                                      src={c.requester.profileImage}
                                      alt={c.requester.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    c.requester?.name?.charAt(0) || "C"
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <div className="font-bold text-gray-900 text-sm truncate">
                                    {c.requester?.name}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    @{c.requester?.username}
                                  </div>
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

          {/* Notifications Modal */}
          {showNotifications && (
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50 p-4 animate-fade-in"
              onClick={() => setShowNotifications(false)}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-slide-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-extrabold text-xl text-gray-900">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {(!notifications || notifications.length === 0) &&
                    (!upcomingEvents || upcomingEvents.length === 0) && (
                      <div className="p-8 text-center text-gray-500 font-medium">
                        All caught up!
                      </div>
                    )}
                  {(upcomingEvents || []).length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold text-yellow-600 uppercase mb-3 tracking-wide">
                        Upcoming Milestones
                      </p>
                      {upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 mb-2 rounded-xl bg-yellow-50 border border-yellow-100 hover:shadow-sm transition-shadow"
                        >
                          <div className="font-bold text-gray-800">
                            {event.name}{" "}
                            {event.type === "birthday" ? "🎂🎈" : "💍"}
                          </div>
                          <div className="text-sm text-yellow-800">
                            In {event.daysUntil} days (
                            {new Date(event.date).toLocaleDateString()})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(notifications || []).length > 0 && (
                    <div className="p-4">
                      <p className="text-xs font-bold text-indigo-600 uppercase mb-3 tracking-wide">
                        Recent Activity
                      </p>
                      {notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-4 mb-2 rounded-xl transition-all ${n.isRead ? "bg-gray-50 opacity-70" : "bg-indigo-50 border border-indigo-100"} flex justify-between`}
                        >
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-sm">
                              {n.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {n.message}
                            </p>
                          </div>
                          {!n.isRead && (
                            <div className="ml-4">
                              <button
                                onClick={() =>
                                  handleMarkNotificationAsRead(n._id)
                                }
                                className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-colors"
                              >
                                Mark Read
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Requests Modal */}
          {showRequests && (
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-start pt-20 z-50 p-4 animate-fade-in"
              onClick={() => setShowRequests(false)}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-slide-down"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-extrabold text-xl text-gray-900">
                    Network Requests
                  </h3>
                  <button
                    onClick={() => setShowRequests(false)}
                    className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {(!friendRequests.received ||
                    friendRequests.received.length === 0) &&
                    (!friendRequests.sent ||
                      friendRequests.sent.length === 0) && (
                      <div className="p-8 text-center text-gray-500 font-medium">
                        No pending requests.
                      </div>
                    )}
                  {(friendRequests.received || []).map((r) => (
                    <div
                      key={r._id}
                      className="p-4 m-2 border rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <p className="font-bold text-gray-900">{r.name}</p>
                      <p className="text-sm text-gray-500 mb-3">{r.email}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(r._id)}
                          className="bg-indigo-600 text-white font-bold py-2.5 flex-1 rounded-xl shadow shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 transition-all"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(r._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-bold py-2 flex-1 rounded-xl transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add Connection Modal */}
          {showAddForm && (
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
              onClick={() => setShowAddForm(false)}
            >
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 flex flex-col animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-extrabold text-xl text-gray-900">
                    Add New Connection
                  </h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-200 rounded-full bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleAddPerson} className="p-6 space-y-5">
                  <div>
                    <label className="font-bold text-gray-700 text-sm ml-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white"
                      placeholder="Target user's sign-in identifier"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 text-sm ml-1">
                      Relationship
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:bg-white font-medium text-gray-700"
                    >
                      <option value="friend">Friend</option>
                      <option value="family">Family</option>
                      <option value="colleague">Colleague</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5 transition-transform font-bold rounded-xl shadow shadow-indigo-200 py-3.5"
                    >
                      Add Connection
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3.5 border-2 font-bold rounded-xl text-gray-600 hover:bg-gray-50 border-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Preview Modal */}
      {imageModal.isOpen && imageModal.src && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setImageModal({ isOpen: false, src: null })}
        >
          <div className="relative max-w-3xl w-full h-auto max-h-[90vh] flex justify-center items-center">
            <button
              className="absolute -top-12 right-0 md:-right-12 text-white hover:text-gray-300 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              onClick={() => setImageModal({ isOpen: false, src: null })}
            >
              <X size={24} />
            </button>
            <img
              src={imageModal.src}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .premium-shadow-hover { box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .premium-shadow-hover:hover { box-shadow: 0 20px 40px rgba(79,70,229,0.08); }
      `}</style>
    </div>
  );
};

export default CircleSection;
