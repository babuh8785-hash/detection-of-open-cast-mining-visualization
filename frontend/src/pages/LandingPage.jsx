import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiActivity, FiLayers, FiShield, FiUploadCloud } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLaunch = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-teal-500/10 blur-[130px] pointer-events-none" />
      
      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-500/20">
            <FiUploadCloud className="w-6 h-6" />
          </span>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            MineDetect
          </span>
        </div>

        <nav className="flex items-center gap-4">
          {token ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-semibold border border-white/10 transition-all duration-200"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-sm font-semibold shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest inline-block mb-6">
          Earth Observation & AI
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Detecting Open Cast Mines <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
            With High Confidence
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          MineDetect leverages cutting-edge deep learning CNN models to analyze satellite imagery. 
          Configure customized OpenCV preprocessing pipelines (contrast enhancement, noise filtering, and edge detection) 
          and track predictions in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
          >
            <span>Launch Platform</span>
            <FiArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-base border border-white/10 flex items-center justify-center transition-all"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold mb-4">
            Designed for Researchers and Regulators
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            A comprehensive web suite to upload, filter, preprocess, predict, and log mining sites safely and transparently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-6 transition-colors group-hover:bg-emerald-500/20">
              <FiActivity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time ML Classifier</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Feed remote-sensing tiles directly into our TensorFlow-backed CNN classifier. Get prediction logs, confidence estimates, and runtime diagnostics in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="p-4 rounded-xl bg-teal-500/10 text-teal-400 w-fit mb-6 transition-colors group-hover:bg-teal-500/20">
              <FiLayers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Custom Preprocessing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Optimize inference by toggling advanced preprocessing steps like adaptive contrast scaling, bilateral noise filtering, and edge sharpness improvements.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-6 transition-colors group-hover:bg-emerald-500/20">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Admin & Team Controls</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Toggle role security configurations. Admins can audit all analysis logs, check globally aggregated accuracy distributions, and manage user accounts securely.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-10 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} MineDetect Project. Open-source satellite imagery analysis platform.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
