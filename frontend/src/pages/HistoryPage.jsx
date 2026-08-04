import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight, 
  FiArrowUp, 
  FiArrowDown, 
  FiTrash2, 
  FiEye 
} from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // History list and pagination states
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filtering, Searching, and Sorting states
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // 'Mining' or 'Non Mining' or ''
  const [sort, setSort] = useState('created_at'); // 'created_at', 'confidence', 'processing_time'
  const [order, setOrder] = useState('desc'); // 'asc' or 'desc'

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    fetchHistory();
  }, [page, filter, sort, order]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/history', {
        params: {
          page,
          limit,
          search,
          filter,
          sort,
          order
        }
      });
      if (response.data.success) {
        setHistory(response.data.data || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load prediction history logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const toggleSort = (field) => {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(field);
      setOrder('desc');
    }
    setPage(1);
  };

  const handleDelete = async (e, predId) => {
    e.stopPropagation(); // Avoid navigating to details page
    if (!window.confirm('Are you sure you want to delete this prediction log and its associated server image files?')) {
      return;
    }

    try {
      const response = await api.delete(`/history/${predId}`);
      if (response.data.success) {
        showToast('Prediction record successfully deleted', 'success');
        // Refresh list
        if (history.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchHistory();
        }
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Deletion failed', 'error');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header title */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Prediction History Log</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {isAdmin 
              ? 'Administrator session: Viewing and managing logs for all registered researchers.' 
              : 'Researcher session: View and query your past open cast mining predictions.'
            }
          </p>
        </div>
      </div>

      {/* Filter and search bar layout */}
      <div className="bg-white dark:bg-dark-900 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
        
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative flex items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search image name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-xs text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400"
          />
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <button type="submit" className="hidden">Search</button>
        </form>

        {/* Filter buttons */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <FiFilter className="w-3.5 h-3.5" />
            <span>Class Filter:</span>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-dark-800 p-0.5 text-xs font-semibold border border-slate-200/50 dark:border-dark-700/50 transition-all duration-300">
            <button
              onClick={() => { setFilter(''); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === ''
                  ? 'bg-white dark:bg-dark-700 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setFilter('Mining'); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'Mining'
                  ? 'bg-white dark:bg-dark-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Mining
            </button>
            <button
              onClick={() => { setFilter('Non Mining'); setPage(1); }}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === 'Non Mining'
                  ? 'bg-white dark:bg-dark-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Clear
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Grid logs */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
        
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-dark-800 transition-colors duration-300">
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-900 select-none transition-colors" onClick={() => toggleSort('image_name')}>
                    <div className="flex items-center gap-1">
                      <span>Image Tile Name</span>
                      {sort === 'image_name' && (order === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  {isAdmin && <th className="py-4 px-6">Uploaded By</th>}
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-900 select-none transition-colors" onClick={() => toggleSort('prediction_result')}>
                    <div className="flex items-center gap-1">
                      <span>Classification Label</span>
                      {sort === 'prediction_result' && (order === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-900 select-none transition-colors" onClick={() => toggleSort('confidence')}>
                    <div className="flex items-center gap-1">
                      <span>Confidence</span>
                      {sort === 'confidence' && (order === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-900 select-none transition-colors" onClick={() => toggleSort('processing_time')}>
                    <div className="flex items-center gap-1">
                      <span>Inference Speed</span>
                      {sort === 'processing_time' && (order === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-dark-900 select-none transition-colors" onClick={() => toggleSort('created_at')}>
                    <div className="flex items-center gap-1">
                      <span>Timestamp</span>
                      {sort === 'created_at' && (order === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right">Inference Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-dark-800 transition-colors duration-300">
                {history.map((record) => (
                  <tr key={record.prediction_id} className="hover:bg-slate-50/50 dark:hover:bg-dark-850/50 transition-colors">
                    <td className="py-4 px-6 font-semibold truncate max-w-[200px]">
                      {record.image?.image_name || `Predict ID #${record.prediction_id}`}
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6">
                        <span className="block font-semibold text-slate-700 dark:text-slate-300">{record.user?.name}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{record.user?.email}</span>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${
                        record.prediction_result === 'Mining'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {record.prediction_result}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-500 dark:text-slate-300">
                      {record.confidence}%
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {record.processing_time}s
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/result/${record.prediction_id}`)}
                          className="p-2 rounded-lg border border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Inspect Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, record.prediction_id)}
                          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-450 transition-colors"
                          title="Delete Prediction"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 text-sm">
            No prediction history matches search configurations.
          </div>
        )}

        {/* Pagination logs controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-dark-800 flex items-center justify-between transition-colors duration-300">
            <span className="text-xs text-slate-400">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2.5 rounded-lg border border-slate-200 dark:border-dark-700 hover:bg-slate-100 dark:hover:bg-dark-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default HistoryPage;
