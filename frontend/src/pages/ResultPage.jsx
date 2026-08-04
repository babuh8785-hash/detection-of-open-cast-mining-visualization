import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiFileText, 
  FiTrash2, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiClock, 
  FiCpu, 
  FiSliders 
} from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api, { BASE_URL } from '../services/api';

const ResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewProcessed, setViewProcessed] = useState(true);

  useEffect(() => {
    fetchResultDetail();
  }, [id]);

  const fetchResultDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/history/${id}`);
      if (response.data.success) {
        setPrediction(response.data.prediction);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load prediction details', 'error');
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this prediction record and all associated image files?')) {
      return;
    }

    try {
      const response = await api.delete(`/history/${id}`);
      if (response.data.success) {
        showToast('Prediction record successfully deleted', 'success');
        navigate('/history');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Deletion failed', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!prediction) return null;

  const isMining = prediction.prediction_result === 'Mining';
  const confidenceColor = isMining ? 'text-emerald-500 bg-emerald-500/10' : 'text-indigo-500 bg-indigo-500/10';
  
  // Format dates
  const timestamp = new Date(prediction.created_at).toLocaleString();

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-800 dark:text-slate-100 print:bg-white print:text-black">
      
      {/* Top action header */}
      <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 text-xs font-semibold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-dark-800 transition-all shadow-sm"
          >
            <FiFileText className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 transition-colors duration-300 print:border-none print:shadow-none print:p-0">
        
        {/* Report Branding for Printing */}
        <div className="hidden print:flex items-center justify-between border-b pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">MineDetect Analysis Report</h1>
            <p className="text-xs text-slate-500 mt-1">Classification and satellite imagery audit document.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">Date: {timestamp}</span>
        </div>

        {/* Dynamic Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Image viewer */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Imagery Workspace</span>
              
              {/* Image Toggle Switches */}
              {prediction.image.processed_image_path && (
                <div className="flex rounded-lg bg-slate-100 dark:bg-dark-800 p-0.5 text-[10px] font-bold border border-slate-200/50 dark:border-dark-700/50 print:hidden transition-colors duration-300">
                  <button
                    onClick={() => setViewProcessed(false)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      !viewProcessed
                        ? 'bg-white dark:bg-dark-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setViewProcessed(true)}
                    className={`px-3 py-1.5 rounded-md transition-all ${
                      viewProcessed
                        ? 'bg-white dark:bg-dark-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Processed
                  </button>
                </div>
              )}
            </div>

            <div className="relative rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 flex items-center justify-center p-3 overflow-hidden min-h-[300px] transition-colors duration-300">
              <img
                src={viewProcessed && prediction.image.processed_image_path 
                  ? `${BASE_URL}${prediction.image.processed_image_path}`
                  : `${BASE_URL}${prediction.image.image_path}`
                }
                alt="Satellite Tile Analysis"
                className="max-h-80 w-auto rounded-lg object-contain shadow-sm border border-slate-200/50 dark:border-dark-800/50"
              />
            </div>
            
            <p className="text-[11px] text-slate-400 leading-normal text-center select-none">
              Source file: <code className="text-emerald-500">{prediction.image.image_name}</code>
            </p>
          </div>

          {/* Right Column: Diagnostic values */}
          <div className="space-y-6 flex flex-col justify-between">
            
            {/* Top diagnostic panel */}
            <div className="space-y-6">
              
              {/* Classification label display */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Status Report</span>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isMining ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400'} transition-colors duration-300`}>
                    {isMining ? <FiAlertTriangle className="w-8 h-8" /> : <FiCheckCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-3xl font-extrabold tracking-tight leading-none">
                      {prediction.prediction_result}
                    </h3>
                    <span className="text-xs text-slate-400 mt-1 block">
                      {isMining 
                        ? 'Satellite features correspond to active open cast excavations.' 
                        : 'No signs of active open-air mining detected.'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence gauges */}
              <div className="space-y-2 border-t border-slate-100 dark:border-dark-800 pt-4 transition-colors duration-300">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>Inference Confidence</span>
                  <span className={isMining ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}>{prediction.confidence}%</span>
                </div>
                
                {/* Horizontal Slider Bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-dark-800 overflow-hidden transition-colors duration-300">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${isMining ? 'from-emerald-500 to-teal-400' : 'from-indigo-500 to-teal-400'}`}
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>

              {/* Statistical variables */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-dark-800 pt-4 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 transition-colors duration-300">
                    <FiClock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Inference Time</span>
                    <span className="text-xs font-bold block mt-0.5">{prediction.processing_time}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 transition-colors duration-300">
                    <FiCpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Model Model Engine</span>
                    <span className="text-xs font-bold block mt-0.5">CNN v1.0.1</span>
                  </div>
                </div>
              </div>

              {/* Preprocessing choices applied */}
              <div className="space-y-3 border-t border-slate-100 dark:border-dark-800 pt-4 transition-colors duration-300">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <FiSliders className="w-3.5 h-3.5" />
                  <span>Applied Preprocessing Filters</span>
                </div>
                
                <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors duration-300">Resize (224x224)</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors duration-300">CLAHE Contrast Stretching</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors duration-300">Normalise Scale</span>
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 transition-colors duration-300">Bilateral Noise Filter</span>
                </div>
              </div>

            </div>

            {/* Audit log trail footer */}
            <div className="border-t border-slate-150 dark:border-dark-800 pt-6 mt-6 md:mt-0 text-[10px] text-slate-400 space-y-1 transition-colors duration-300">
              <div className="flex justify-between">
                <span>Diagnostic ID:</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">#{prediction.prediction_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Satellite Tile Uploaded By:</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">{prediction.user?.name || 'Researcher'} ({prediction.user?.email})</span>
              </div>
              <div className="flex justify-between">
                <span>Inference Executed At:</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">{timestamp}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ResultPage;
