import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Calendar, Heart, ShieldCheck, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfileState } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (user && user.profileComplete) {
      setFormData({
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
      setIsEditing(true); // default to editing if profile is incomplete
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['state', 'district', 'pinCode', 'street'].includes(name)) {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateProfileState(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      if (!user?.profileComplete) {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!user?.profileComplete) {
      navigate('/dashboard');
    } else {
      setIsEditing(false);
    }
  };

  // Render View Mode
  if (!isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
          {/* Header Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          
          <div className="px-8 pb-8 flex flex-col pt-4">
            <div className="flex justify-between items-start -mt-16 mb-8">
              <div className="bg-white p-2 rounded-full shadow-md">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-indigo-500">
                  <User size={48} />
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-16 flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Edit3 size={18} />
                Edit Details
              </button>
            </div>

            <div className="mb-6 border-b border-gray-100 pb-6">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 font-medium tracking-wide">@{user?.username}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full w-max">
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
                  <p className="text-lg text-gray-800 font-medium">{user?.maritalStatus}</p>
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

          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="flex items-center gap-4 pt-6 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Saving details...' : 'Save Profile Details'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
