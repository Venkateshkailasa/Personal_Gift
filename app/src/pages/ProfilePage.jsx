/**
 * ProfilePage Component
 * User profile management page with editing capabilities
 * Handles profile completion for new users and profile updates for existing users
 */

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Calendar, Heart, ShieldCheck, Edit3, ImageIcon, X, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  // Context and navigation hooks
  const { user, updateProfileState, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Component state management
  const [isEditing, setIsEditing] = useState(false); // Edit mode toggle
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [showImageModal, setShowImageModal] = useState(false); // Image modal visibility

  // Profile form data state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
    mobileNumber: '',
    dateOfBirth: '',
    maritalStatus: 'Single',
    marriageDate: '',
    address: {
      state: '',
      district: '',
      pinCode: '',
      street: ''
    }
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user && user.profileComplete) {
      // Populate form with existing user data
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        mobileNumber: user.mobileNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        maritalStatus: user.maritalStatus || 'Single',
        marriageDate: user.marriageDate ? new Date(user.marriageDate).toISOString().split('T')[0] : '',
        address: {
          state: user.address?.state || '',
          district: user.address?.district || '',
          pinCode: user.address?.pinCode || '',
          street: user.address?.street || ''
        }
      });
    } else {
      // New user - enable editing by default
      setIsEditing(true);
    }
  }, [user]);

  /**
   * Handles input field changes
   * Updates form data state, handling nested address fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['state', 'district', 'pinCode', 'street'].includes(name)) {
      // Update nested address object
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value
        }
      });
    } else {
      // Update regular form fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  /**
   * Handles profile form submission
   * Updates user profile and redirects if profile was incomplete
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile via API
      const response = await authAPI.updateProfile(formData);
      updateProfileState(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);

      // Redirect to dashboard if this was initial profile setup
      if (!user?.profileComplete) {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile setup failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles profile image file upload
   * Converts file to base64 data URL for storage
   */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData({ ...formData, profileImage: reader.result });
    };
  };

  const handleCancel = () => {
    if (!user?.profileComplete) {
      navigate('/dashboard');
    } else if (isEditing) {
      setIsEditing(false);
    } else {
      navigate(-1);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        await authAPI.deleteProfile();
        toast.success('Account deleted successfully');
        logout();
        navigate('/login');
      } catch (err) {
        toast.error('Failed to delete account');
        console.error('Delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading || (user === null && !loading && !isEditing)) {
    return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <p className="text-gray-500 font-medium">Loading profile...</p>
       </div>
    );
  }

  // Render View Mode
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
          {/* Header Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          
          <div className="px-8 pb-8 flex flex-col pt-4">
            <div className="flex justify-between items-start -mt-16 mb-8">
              <div 
                className={`bg-white p-2 rounded-full shadow-md z-10 relative premium-shadow-hover ${user?.profileImage ? 'cursor-pointer' : ''}`} 
                onClick={() => user?.profileImage && setShowImageModal(true)}
              >
                {user?.profileImage ? (
                   <img src={user.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-inner bg-white" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-500">
                    <User size={48} />
                  </div>
                )}
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-16 flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition-all btn-hover shadow-sm"
              >
                <Edit3 size={18} />
                Edit Details
              </button>
            </div>

            <div className="mb-6 border-b border-gray-100 pb-6">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 font-medium tracking-wide">@{user?.username || 'user'}</p>
              {user?.bio && (
                 <p className="mt-4 text-gray-700 leading-relaxed max-w-2xl">{user.bio}</p>
              )}
              <div className="flex items-center gap-2 mt-4 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full w-max">
                <ShieldCheck size={16} /> Verified Account
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-start gap-4">
                <Phone className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                  <p className="text-lg text-gray-800 font-medium">{user?.mobileNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Calendar className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-lg text-gray-800 font-medium">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Heart className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Marital Status</p>
                  <p className="text-lg text-gray-800 font-medium">{user?.maritalStatus || 'Not provided'}</p>
                </div>
              </div>

              {user?.maritalStatus === 'Married' && user?.marriageDate && (
                <div className="flex items-start gap-4">
                  <Calendar className="text-indigo-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Anniversary</p>
                    <p className="text-lg text-gray-800 font-medium">
                      {new Date(user.marriageDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 md:col-span-2 mt-2 pt-6 border-t border-gray-100">
                <MapPin className="text-gray-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-500">Address Location</p>
                  <p className="text-lg text-gray-800 font-medium mt-1">
                    {user?.address?.street ? `${user.address.street}, ` : ''}
                    {user?.address?.district ? `${user.address.district}, ` : ''}
                    {user?.address?.state ? `${user.address.state} ` : ''}
                    {user?.address?.pinCode ? `- ${user.address.pinCode}` : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-red-100">
               <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                 <ShieldCheck size={20} /> Danger Zone
               </h3>
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Delete My Account</p>
                    <p className="text-sm text-gray-600 mt-1">Permanently delete your account and all associated data.</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteAccount();
                    }}
                    className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 btn-hover flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Delete My Account
                  </button>
                </div>
            </div>
          </div>
        </div>
        
        {/* Image Preview Modal */}
        {showImageModal && user?.profileImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-3xl w-full h-auto max-h-[90vh] flex justify-center items-center">
              <button 
                className="absolute -top-12 right-0 md:-right-12 text-white hover:text-gray-300 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors" 
                onClick={() => setShowImageModal(false)}
              >
                <X size={24} />
              </button>
              <img src={user.profileImage} alt="Profile Preview" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Edit Mode
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden p-8 border-t-8 border-indigo-500">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          {user?.profileComplete ? 'Update Your Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-gray-500 mb-8">
          Update your personal information to help us personalize your experience.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6 border-b border-gray-100 pb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0">
              {formData.profileImage ? (
                 <img src={formData.profileImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                 <User size={32} className="text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <label className="cursor-pointer text-white text-xs font-bold text-center w-full h-full flex items-center justify-center">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-gray-700 text-sm font-bold mb-2 flex items-center gap-2"><ImageIcon size={16} className="text-gray-400"/> Or provide Image URL</label>
              <input
                type="url"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50 text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-2 mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Bio / About Me</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Tell us a bit about yourself..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number *</label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Marital Status *</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
              </select>
            </div>

            {formData.maritalStatus === 'Married' && (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Anniversary Date *</label>
                <input
                  type="date"
                  name="marriageDate"
                  value={formData.marriageDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50 focus:bg-indigo-50/50"
                  required={formData.maritalStatus === 'Married'}
                />
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">Street Name / Apt *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">District / City *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.address.district}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">PIN Code *</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.address.pinCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50/50"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 pt-6 mt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Saving details...' : 'Save Profile Details'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 w-full md:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteAccount();
              }}
              className="w-full md:w-auto px-6 py-3 text-red-500 hover:text-red-700 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={18}/> Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
