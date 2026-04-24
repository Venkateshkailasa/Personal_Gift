/**
 * AdminUsersPage Component
 * Administrative interface for managing registered users
 * Allows viewing, searching, and deleting user accounts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';
import toast from 'react-hot-toast';
import { Users, Trash2, ArrowLeft, Search, LogOut, LayoutDashboard } from 'lucide-react';

const AdminUsersPage = () => {
  // Component state
  const [users, setUsers] = useState([]); // List of all users
  const [loading, setLoading] = useState(true); // Loading state
  const [searchTerm, setSearchTerm] = useState(''); // Search filter term

  // Navigation hook
  const navigate = useNavigate();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Fetches all registered users from admin API
   */
  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user deletion with confirmation
   * @param {string} userId - ID of user to delete
   */
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their data?')) return;

    try {
      await adminAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh user list
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
       {/* Admin Sidebar Navigation */}
       <div className="w-64 bg-slate-900 text-white flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 text-center border-b border-slate-800">
          <h1 className="text-xl font-bold tracking-tight">Admin Control</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard Button */}
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white"
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          {/* Manage Users Button (Active) */}
          <button
            onClick={() => navigate('/admin/users')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Users size={20} /> Manage Users
          </button>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header Section */}
        <header className="mb-8">
          {/* Back Button and Title */}
          <div className="flex items-center gap-4 mb-4">
             <button onClick={() => navigate('/admin-dashboard')} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                <ArrowLeft size={20} className="text-slate-600" />
             </button>
             <h2 className="text-3xl font-bold text-slate-800">Registered Users</h2>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input
               type="text"
               placeholder="Search by username or name..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
             />
          </div>
        </header>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-slate-500 font-bold text-sm uppercase tracking-wider">User Info</th>
                <th className="px-6 py-4 text-slate-500 font-bold text-sm uppercase tracking-wider text-center">Age</th>
                <th className="px-6 py-4 text-slate-500 font-bold text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                   <td colSpan="3" className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                   <td colSpan="3" className="px-6 py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            {user.username.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <p className="font-bold text-slate-800">@{user.username}</p>
                               <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono">{user._id}</span>
                            </div>
                            <p className="text-xs text-slate-500">{user.email || user.name || 'No contact info'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                             {user.age} yrs
                          </span>
                          <span className="text-[10px] text-slate-400 mt-1">
                             {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'No DOB'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleDeleteUser(user._id)}
                         className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                         title="Delete User"
                       >
                          <Trash2 size={20} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
