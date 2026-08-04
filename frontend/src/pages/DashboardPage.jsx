import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiUploadCloud, 
  FiUser, 
  FiShield, 
  FiActivity, 
  FiAlertTriangle,
  FiCheckCircle,
  FiClock 
} from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

// Chart.js registration
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalDetections: 0,
    miningCount: 0,
    nonMiningCount: 0,
    avgConfidence: 0,
    recentDetections: []
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // Fetch Admin specific global statistics
        const response = await api.get('/admin/dashboard');
        if (response.data.success) {
          const data = response.data.analytics;
          setStats({
            totalDetections: data.total_predictions,
            miningCount: data.mining_images,
            nonMiningCount: data.non_mining_images,
            avgConfidence: data.prediction_accuracy,
            recentDetections: data.recent_predictions || []
          });
        }
      } else {
        // Standard user: retrieve history to compute statistics client-side
        const response = await api.get('/history?limit=100');
        if (response.data.success) {
          const records = response.data.data || [];
          
          let mining = 0;
          let nonMining = 0;
          let sumConfidence = 0;
          
          records.forEach(r => {
            if (r.prediction_result === 'Mining') mining++;
            else nonMining++;
            sumConfidence += r.confidence;
          });

          const avgConf = records.length > 0 ? (sumConfidence / records.length) : 0;

          setStats({
            totalDetections: records.length,
            miningCount: mining,
            nonMiningCount: nonMining,
            avgConfidence: Math.round(avgConf * 100) / 100,
            recentDetections: records.slice(0, 5) // Last 5
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load dashboard insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pie chart config
  const chartData = {
    labels: ['Mining Sites', 'Non-Mining Sites'],
    datasets: [
      {
        data: [stats.miningCount, stats.nonMiningCount],
        backgroundColor: [
          'rgba(16, 185, 129, 0.75)', // Emerald-500
          'rgba(99, 102, 241, 0.75)'  // Indigo-500
        ],
        borderColor: [
          '#10b981',
          '#6366f1'
        ],
        borderWidth: 1.5,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Outfit', size: 12 }
        }
      }
    }
  };

  // Build line chart config for recent detections
  const lineChartData = {
    labels: stats.recentDetections.slice().reverse().map(d => new Date(d.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})),
    datasets: [
      {
        label: 'Prediction Confidence (%)',
        data: stats.recentDetections.slice().reverse().map(d => d.confidence),
        fill: false,
        borderColor: '#10b981',
        tension: 0.25,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        min: 50,
        max: 100,
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
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
      
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Hello, {user.name || 'Mining Researcher'}!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isAdmin 
              ? 'Administrator session: Accessing platform analytics metrics and account database.' 
              : 'Researcher session: Review, process, and analyze open cast mining locations.'
            }
          </p>
        </div>

        <Link
          to="/detection"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all"
        >
          <FiUploadCloud className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 flex items-center justify-between transition-colors duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Inferences</span>
            <span className="text-3xl font-extrabold mt-1 block">{stats.totalDetections}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 transition-colors duration-300">
            <FiActivity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Mining */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 flex items-center justify-between transition-colors duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Mining Detected</span>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{stats.miningCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 transition-colors duration-300">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Non Mining */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 flex items-center justify-between transition-colors duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Clear Sites</span>
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 block">{stats.nonMiningCount}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
            <FiCheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Avg Confidence */}
        <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 flex items-center justify-between transition-colors duration-300">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Confidence</span>
            <span className="text-3xl font-extrabold mt-1 block">{stats.avgConfidence}%</span>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 transition-colors duration-300">
            <FiClock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Distribution Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <h3 className="font-bold text-base">Inference Classification Split</h3>
            <p className="text-xs text-slate-400 mt-0.5">Ratio of active mine findings vs clear environment plots.</p>
          </div>
          
          <div className="h-60 mt-6 relative flex items-center justify-center">
            {stats.totalDetections > 0 ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="text-slate-400 text-sm text-center">
                No prediction transactions found. Create an analysis to generate charts.
              </div>
            )}
          </div>
        </div>

        {/* Line Chart Analytics */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <div>
            <h3 className="font-bold text-base">Prediction Confidence Over Time</h3>
            <p className="text-xs text-slate-400 mt-0.5">Statistical confidence outputs for the most recent classifications.</p>
          </div>

          <div className="h-60 mt-6">
            {stats.totalDetections > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Inference graph compiles automatically after model activation logs are written.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recent Predictions Table log */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Recent Prediction Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Review history transactions compiled on server audits.</p>
          </div>
          <Link to="/history" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
            View All Logs
          </Link>
        </div>

        {stats.recentDetections.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-950 text-slate-400 text-[10px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-dark-800 transition-colors duration-300">
                  <th className="py-3.5 px-6">Image Source</th>
                  <th className="py-3.5 px-6">Label Output</th>
                  <th className="py-3.5 px-6">Confidence</th>
                  <th className="py-3.5 px-6">Inference Time</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-dark-800 transition-colors duration-300">
                {stats.recentDetections.map((item) => (
                  <tr key={item.prediction_id} className="hover:bg-slate-50/50 dark:hover:bg-dark-850/50 transition-colors">
                    <td className="py-4 px-6 font-semibold truncate max-w-[200px]">
                      {item.image?.image_name || `Predict Record #${item.prediction_id}`}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        item.prediction_result === 'Mining'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {item.prediction_result}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-300">
                      {item.confidence}%
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {item.processing_time}s
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => navigate(`/result/${item.prediction_id}`)}
                        className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-dark-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-dark-800 transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">
            No inferences registered yet. Begin by uploading satellite tiles to active classifier!
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardPage;
