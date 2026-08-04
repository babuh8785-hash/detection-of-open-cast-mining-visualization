import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiArrowRight, FiUploadCloud } from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Default to standard researcher user
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('All fields are required', 'warning');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      showToast(response.data.message || 'Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Registration failed, please try again.', 'error');
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
            Create Account
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Join the MineDetect Mining Analysis Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FiUser className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm transition-all duration-200 placeholder-slate-500 text-white"
              />
            </div>
          </div>

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
                placeholder="jane.doe@company.com"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm transition-all duration-200 placeholder-slate-500 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm transition-all duration-200 placeholder-slate-500 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  role === 'user'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Researcher (User)
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                  role === 'admin'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Administrator
              </button>
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
                <span>Sign Up</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
