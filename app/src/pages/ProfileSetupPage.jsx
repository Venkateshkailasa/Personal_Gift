import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../api';

export default function ProfileSetupPage() {
  const { user, updateProfileState } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateProfileState(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {user?.profileComplete ? 'Edit Your Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {user?.profileComplete ? 'Ensure your details are up to date.' : 'Tell us a little more about yourself!'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Marital Status</label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          </div>

          {formData.maritalStatus === 'Married' && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Marriage Date</label>
              <input
                type="date"
                name="marriageDate"
                value={formData.marriageDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                required={formData.maritalStatus === 'Married'}
              />
            </div>
          )}

          <div className="pt-2">
            <h3 className="text-gray-800 font-bold mb-2 border-b pb-1">Address Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.address.district}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">PIN Code</label>
                <input
                  type="text"
                  name="pinCode"
                  value={formData.address.pinCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Street Name</label>
                <input
                  type="text"
                  name="street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50 mt-6"
          >
            {loading ? 'Saving details...' : (user?.profileComplete ? 'Update Profile' : 'Continue to Dashboard')}
          </button>
        </form>
      </div>
    </div>
  );
}
