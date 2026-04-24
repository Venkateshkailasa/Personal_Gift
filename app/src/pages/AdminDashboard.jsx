/**
 * AdminDashboard Component
 * Administrative control panel for system management
 * Provides system statistics and administrative functions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api';
import toast from 'react-hot-toast';
import { Users, Trash2, RefreshCw, LogOut, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  // Component state
  const [stats, setStats] = useState({ totalUsers: 0 }); // System statistics
  const [loading, setLoading] = useState(true); // Loading state

  // Navigation hook
  const navigate = useNavigate();

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  /**
   * Fetches system statistics from admin API
   */
  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles system restart functionality
   * Triggers system restart and refreshes statistics
   */
  const handleRestartSystem = async () => {
    setLoading(true);
    try {
      await adminAPI.restartSystem();
      toast.success('System restarted & data updated');
      fetchStats(); // Refresh stats after restart
    } catch (err) {
      toast.error('Failed to restart system');
    } finally {
      setLoading(false);
    }
  };

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
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>

          {/* Manage Users Button */}
          <button
            onClick={() => navigate('/admin/users')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 rounded-xl font-medium transition-all text-slate-400 hover:text-white"
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
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">System Overview</h2>
            <p className="text-slate-500 mt-1">Monitor and manage the platform.</p>
          </div>

          {/* System Restart Button */}
          <button
            onClick={handleRestartSystem}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
          >
            <RefreshCw size={18} /> System Restart
          </button>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse flex space-x-4">
             <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                   <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                   </div>
                   <div className="h-2 bg-slate-200 rounded"></div>
                </div>
             </div>
          </div>
        ) : (
          /* Statistics Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
               <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Users size={32} />
               </div>
               <div>
                  <p className="text-slate-500 font-medium">Total Registered Users</p>
                  <p className="text-4xl font-black text-slate-800 mt-1">{stats.totalUsers}</p>
               </div>
            </div>
            
            <div 
              onClick={() => navigate('/admin/users')}
              className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center cursor-pointer hover:bg-indigo-50 transition-all border-dashed border-2 group"
            >
               <div className="text-center">
                  <p className="font-bold text-slate-800 group-hover:text-indigo-600">View All Users</p>
                  <p className="text-sm text-slate-400 mt-1">Detailed user list & management</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
