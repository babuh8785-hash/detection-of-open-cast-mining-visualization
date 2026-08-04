import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShield, 
  FiUsers, 
  FiActivity, 
  FiClock, 
  FiTrash2, 
  FiAlertTriangle, 
  FiTrendingUp, 
  FiCheckCircle 
} from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const AdminPage = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users'); // 'users' or 'system'

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get('/admin/users');
      const dashboardRes = await api.get('/admin/dashboard');

      if (usersRes.data.success) {
        setUsers(usersRes.data.users || []);
      }
      if (dashboardRes.data.success) {
        setAnalytics(dashboardRes.data.analytics);
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Access Denied: Admin privileges required.', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (cachedUser.user_id === userId) {
      showToast('Self-deletion is forbidden.', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user account '${userEmail}'? This action will permanently remove all their uploaded images and prediction history.`)) {
      return;
    }

    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        showToast(response.data.message || 'User account successfully deleted', 'success');
        // Refresh grids
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete user account', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Administration</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Overview platform health, track registered researcher accounts, and inspect server statistics.
          </p>
        </div>
      </div>

      {/* Analytics stats dashboard */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-dark-900 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex items-center justify-between transition-colors duration-300">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Users</span>
              <span className="text-2xl font-extrabold mt-1 block">{analytics.total_users}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <FiUsers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex items-center justify-between transition-colors duration-300">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Inferences</span>
              <span className="text-2xl font-extrabold mt-1 block">{analytics.total_predictions}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 transition-colors duration-300">
              <FiActivity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex items-center justify-between transition-colors duration-300">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Mine Findings</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{analytics.mining_images}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
              <FiAlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-dark-900 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex items-center justify-between transition-colors duration-300">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Accuracy</span>
              <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 block">{analytics.prediction_accuracy}%</span>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 transition-colors duration-300">
              <FiTrendingUp className="w-5 h-5" />
            </div>
          </div>

        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-dark-800 text-xs font-semibold uppercase tracking-wider transition-colors duration-300">
        <button
          onClick={() => setTab('users')}
          className={`py-3 px-6 border-b-2 transition-all ${
            tab === 'users'
              ? 'border-emerald-500 text-slate-800 dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          User Accounts Directory ({users.length})
        </button>
        <button
          onClick={() => setTab('system')}
          className={`py-3 px-6 border-b-2 transition-all ${
            tab === 'system'
              ? 'border-emerald-500 text-slate-800 dark:text-white'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          System Diagnostics Logs
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
        
        {tab === 'users' ? (
          <div>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-dark-800 transition-colors duration-300">
                      <th className="py-4 px-6">User Profile</th>
                      <th className="py-4 px-6">Privilege Role</th>
                      <th className="py-4 px-6">Image Uploads</th>
                      <th className="py-4 px-6">Predictions Run</th>
                      <th className="py-4 px-6">Created Timestamp</th>
                      <th className="py-4 px-6 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-dark-800 transition-colors duration-300">
                    {users.map((item) => (
                      <tr key={item.user_id} className="hover:bg-slate-50/50 dark:hover:bg-dark-850/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-800 font-bold flex items-center justify-center text-emerald-500 transition-colors duration-300">
                              {item.name ? item.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span className="block font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">{item.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                            item.role === 'admin'
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400'
                          } transition-colors duration-300`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-350">
                          {item.total_uploads}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-350">
                          {item.total_predictions}
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(item.user_id, item.email)}
                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-455 transition-colors disabled:opacity-40"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400 text-sm">
                No user accounts registered.
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div>
              <h4 className="font-bold text-sm mb-2">Platform Diagnostics Logs</h4>
              <p className="text-xs text-slate-400 leading-normal">
                Audited data summaries of the active ML and preprocessing pipeline. These metrics indicate overall environment status.
              </p>
            </div>

            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-dark-800 transition-colors duration-300">
                <div className="space-y-4">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">Model Load Environment</h5>
                  
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 space-y-2 transition-colors duration-300">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Hardware Framework:</span>
                      <span className="font-semibold">TensorFlow (CPU)</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Model File Path:</span>
                      <span className="font-semibold text-emerald-500">backend/ml/model.h5</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Input Tile Dimensions:</span>
                      <span className="font-semibold">224 x 224 px (RGB)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400">Database Audit Ratios</h5>
                  
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 space-y-2 transition-colors duration-300">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Mining Site Counts:</span>
                      <span className="font-semibold text-emerald-500">{analytics.mining_images}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Clear Terrain Counts:</span>
                      <span className="font-semibold text-indigo-500">{analytics.non_mining_images}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Verification Rate:</span>
                      <span className="font-semibold text-teal-500">100.0% Audited</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default AdminPage;
