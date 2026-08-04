import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiShield, FiUploadCloud } from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      showToast('Welcome back to MineDetect!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Invalid credentials, please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white relative overflow-hidden font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Main Glass Container */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-glass-dark z-10 transition-all duration-300">
        
        {/* Header/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/20 mb-4 animate-pulse">
            <FiUploadCloud className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            MineDetect Portal
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Open Cast Mining Remote Sensing & Analysis Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FiMail className="w-5 h-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@opencast.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm transition-all duration-200 placeholder-slate-500 text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm transition-all duration-200 placeholder-slate-500 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo credentials overlay panel */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 mb-1">
            <FiShield className="text-emerald-400 w-3.5 h-3.5" />
            <span>Developer Test Accounts:</span>
          </div>
          <div className="flex justify-between">
            <span>Admin Email: <code className="text-emerald-400">admin@opencast.com</code></span>
            <span>Pass: <code className="text-emerald-400">adminpassword</code></span>
          </div>
          <div className="flex justify-between">
            <span>Researcher Email: <code className="text-emerald-400">user@opencast.com</code></span>
            <span>Pass: <code className="text-emerald-400">userpassword</code></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
