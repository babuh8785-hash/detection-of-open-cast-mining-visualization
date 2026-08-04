import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiLayout, 
  FiUploadCloud, 
  FiClock, 
  FiUser, 
  FiShield, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiMoon, 
  FiSun 
} from 'react-icons/fi';
import { useToast } from '../hooks/useToast';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Parse user info
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  // Manage Dark Mode state
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.body.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiLayout },
    { name: 'Detection & Analysis', path: '/detection', icon: FiUploadCloud },
    { name: 'Prediction History', path: '/history', icon: FiClock },
    { name: 'User Profile', path: '/profile', icon: FiUser },
  ];

  if (isAdmin) {
    navigationItems.push({ name: 'Admin Panel', path: '/admin', icon: FiShield });
  }

  const getPageTitle = () => {
    const current = navigationItems.find(item => location.pathname.startsWith(item.path));
    if (location.pathname.startsWith('/result')) return 'Analysis Result';
    return current ? current.name : 'Open Cast Detection';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* 1. Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-dark-950/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. Sidebar Navigation Component */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen border-r border-slate-200 dark:border-dark-800 flex flex-col justify-between transition-transform duration-300 transform md:transform-none bg-white/70 dark:bg-dark-900/70 backdrop-blur-lg ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full justify-between">
          <div>
            {/* Header branding */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-dark-800">
              <Link to="/dashboard" className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md">
                  <FiUploadCloud className="w-5 h-5" />
                </span>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  MineDetect
                </span>
              </Link>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 md:hidden"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="mt-8 flex flex-col gap-1.5">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/10' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile capsule and logout */}
          <div className="pt-6 border-t border-slate-200 dark:border-dark-800">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white shadow-inner">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate leading-tight">{user.name || 'User'}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">{user.email || 'user@opencast.com'}</span>
                {isAdmin && (
                  <span className="w-fit text-[9px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full mt-1.5 uppercase">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 3. Main Contents Pane */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto">
        {/* Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-dark-800 bg-white/70 dark:bg-dark-900/70 backdrop-blur-lg flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-100 dark:hover:bg-dark-800 md:hidden"
            >
              <FiMenu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark Mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <FiSun className="w-4.5 h-4.5 text-amber-400" /> : <FiMoon className="w-4.5 h-4.5 text-slate-600" />}
            </button>
          </div>
        </header>

        {/* View Page outlet container */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
