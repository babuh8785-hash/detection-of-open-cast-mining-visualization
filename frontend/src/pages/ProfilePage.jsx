import React, { useState } from 'react';
import { FiUser, FiMail, FiLock, FiCheckCircle, FiShield } from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const ProfilePage = () => {
  const { showToast } = useToast();
  
  // Parse user info
  const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Form states
  const [name, setName] = useState(cachedUser.name || '');
  const [email, setEmail] = useState(cachedUser.email || '');
  
  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [updatingInfo, setUpdatingInfo] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const isAdmin = cachedUser.role === 'admin';

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Name and email are required', 'warning');
      return;
    }

    setUpdatingInfo(true);
    try {
      const response = await api.put('/user/profile', { name, email });
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showToast('Profile information successfully updated', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to update profile information', 'error');
    } finally {
      setUpdatingInfo(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required to update password', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation password do not match', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await api.put('/user/profile', {
        old_password: oldPassword,
        new_password: newPassword
      });
      if (response.data.success) {
        showToast('Password updated successfully', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Current password validation failed', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">User Profile Settings</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Configure profile detail credentials and maintain system access permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side Profile Card */}
        <div className="md:col-span-1 bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-col items-center justify-between text-center transition-colors duration-300">
          <div className="space-y-4">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-extrabold text-white text-3xl shadow-inner mx-auto">
              {name ? name[0].toUpperCase() : 'U'}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg truncate max-w-[200px] mx-auto">{name}</h3>
              <p className="text-xs text-slate-400 truncate max-w-[200px] mx-auto">{email}</p>
            </div>

            <div className="pt-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                isAdmin 
                  ? 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40' 
                  : 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-dark-850'
              } transition-colors duration-300`}>
                {isAdmin ? <FiShield className="w-3.5 h-3.5" /> : <FiUser className="w-3.5 h-3.5" />}
                <span>{isAdmin ? 'System Admin' : 'Researcher'}</span>
              </span>
            </div>
          </div>

          <div className="border-t border-slate-150 dark:border-dark-800 w-full pt-4 mt-6 text-[10px] text-slate-400 flex flex-col gap-1 transition-colors duration-300">
            <div className="flex justify-between">
              <span>Account Type:</span>
              <span className="font-semibold text-slate-500">{isAdmin ? 'Admin' : 'Researcher'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-emerald-500">Active</span>
            </div>
          </div>
        </div>

        {/* Right Side Settings Panels */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Panel 1: Profile Info Form */}
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-sm border-b border-slate-250 dark:border-dark-800 pb-3 mb-5 flex items-center gap-2">
              <FiUser className="text-emerald-500 w-4 h-4" />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400"><FiUser className="w-4 h-4" /></span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400"><FiMail className="w-4 h-4" /></span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane.doe@company.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-all"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingInfo}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {updatingInfo ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Panel 2: Secure Password Form */}
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm transition-colors duration-300">
            <h3 className="font-bold text-sm border-b border-slate-250 dark:border-dark-800 pb-3 mb-5 flex items-center gap-2">
              <FiLock className="text-emerald-500 w-4 h-4" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400"><FiLock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400"><FiLock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400"><FiLock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-55 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:border-emerald-500 focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-all"
                    />
                  </div>
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {updatingPassword ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheckCircle className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
