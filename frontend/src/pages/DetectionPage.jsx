import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUploadCloud, 
  FiFile, 
  FiImage, 
  FiX, 
  FiSliders, 
  FiPlayCircle, 
  FiCheck 
} from 'react-icons/fi';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const DetectionPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  
  // Pipeline Preprocessing States (defaults match backend assumptions)
  const [resize, setResize] = useState(true);
  const [normalize, setNormalize] = useState(true);
  const [noiseRemoval, setNoiseRemoval] = useState(true);
  const [enhancement, setEnhancement] = useState(true);

  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  // Handle file select click
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/tiff'];
    if (!validTypes.includes(selectedFile.type)) {
      showToast('Unsupported file type. Please upload PNG, JPG, BMP, or TIFF satellite tiles.', 'error');
      return;
    }
    
    // Check file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('Image size exceeds 10MB file limit.', 'error');
      return;
    }

    setFile(selectedFile);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartAnalysis = async () => {
    if (!file) {
      showToast('Please select or drop a satellite image to begin', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    let uploadedImageId = null;

    try {
      // 1. Upload the raw satellite tile
      const uploadRes = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadRes.data.success && uploadRes.data.image) {
        uploadedImageId = uploadRes.data.image.image_id;
        showToast('Satellite tile uploaded successfully. Ready for ML prediction.', 'success');
      } else {
        throw new Error('Upload parsed successfully but image ID is missing.');
      }

      setUploading(false);
      setPredicting(true);

      // 2. Trigger the OpenCV preprocessing + TensorFlow prediction pipelines
      const predictRes = await api.post('/predict', {
        image_id: uploadedImageId,
        resize: resize,
        normalize: normalize,
        noise_removal: noiseRemoval,
        enhancement: enhancement
      });

      if (predictRes.data.success && predictRes.data.prediction) {
        showToast('CNN Inference model processed satellite tile successfully!', 'success');
        const predId = predictRes.data.prediction.prediction_id;
        navigate(`/result/${predId}`);
      } else {
        throw new Error('Prediction request completed but result parameters are invalid.');
      }

    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Operation failed.';
      showToast(errMsg, 'error');
      setUploading(false);
      setPredicting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Overview Intro */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Open Cast Mining Detection</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
          Upload satellite tiles and configure pre-processing switches for the convolutional neural network classification engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side Upload Workspace Panel */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Drag & Drop zone container */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current.click()}
            className={`relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all duration-200 cursor-pointer min-h-[340px] bg-white dark:bg-dark-900 ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10 scale-[0.99]' 
                : 'border-slate-300 dark:border-dark-800 hover:border-emerald-500/50 hover:bg-slate-50/50 dark:hover:bg-dark-850/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".png,.jpg,.jpeg,.bmp,.tiff"
            />

            {preview ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative p-2" onClick={(e) => e.stopPropagation()}>
                <img
                  src={preview}
                  alt="Satellite Preview"
                  className="max-h-60 rounded-xl object-contain shadow-md border border-slate-200 dark:border-dark-800"
                />
                
                <div className="mt-4 flex items-center gap-3 bg-slate-100 dark:bg-dark-800 px-4 py-2 rounded-xl text-xs font-semibold">
                  <FiFile className="text-slate-400" />
                  <span className="truncate max-w-[200px] text-slate-600 dark:text-slate-300">{file.name}</span>
                  <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  <button
                    onClick={clearFile}
                    className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-dark-750 text-rose-500 transition-colors"
                    title="Remove Image"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 w-fit mx-auto transition-colors duration-300">
                  <FiUploadCloud className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-base">Drag and drop satellite tile</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports PNG, JPG, JPEG, BMP or TIFF tiles up to 10MB
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {/* Dynamic state notification overlays */}
          {(uploading || predicting) && (
            <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm border border-slate-200 dark:border-dark-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center transition-all duration-300">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                {uploading ? (
                  <FiUploadCloud className="w-4 h-4 text-emerald-500 absolute animate-pulse" />
                ) : (
                  <FiPlayCircle className="w-4 h-4 text-emerald-500 absolute animate-pulse" />
                )}
              </div>

              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {uploading ? 'Uploading Satellite Tile...' : 'Running Image Preprocessing & CNN Classification...'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  {uploading 
                    ? 'Transferring raw imagery files securely to backend servers.' 
                    : 'Applying OpenCV image contrast stretching and executing CNN models.'
                  }
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right Side Options Preprocessing Panel */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-sm transition-colors duration-300">
            
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-dark-800 pb-4 mb-5">
              <FiSliders className="text-emerald-500 w-5 h-5" />
              <h3 className="font-bold text-sm">Preprocessing Setup</h3>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-4">
              
              {/* Option 1: Resize */}
              <div 
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setResize(!resize)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                  resize 
                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-dark-700 hover:border-slate-400 dark:hover:border-dark-600'
                }`}>
                  {resize && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-bold block select-none">Resolution Scaling</span>
                  <span className="text-[10px] text-slate-400 block select-none mt-0.5">Resize to model inputs (224x224 px)</span>
                </div>
              </div>

              {/* Option 2: Normalize */}
              <div 
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setNormalize(!normalize)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                  normalize 
                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-dark-700 hover:border-slate-400 dark:hover:border-dark-600'
                }`}>
                  {normalize && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-bold block select-none">Normalisation (0 - 1)</span>
                  <span className="text-[10px] text-slate-400 block select-none mt-0.5">Scale floating point values down to 1.0f</span>
                </div>
              </div>

              {/* Option 3: Noise Removal */}
              <div 
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setNoiseRemoval(!noiseRemoval)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                  noiseRemoval 
                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-dark-700 hover:border-slate-400 dark:hover:border-dark-600'
                }`}>
                  {noiseRemoval && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-bold block select-none">Noise Removal</span>
                  <span className="text-[10px] text-slate-400 block select-none mt-0.5">Bilateral filter checks for pixel clutter</span>
                </div>
              </div>

              {/* Option 4: Contrast Enhancement */}
              <div 
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setEnhancement(!enhancement)}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                  enhancement 
                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                    : 'border-slate-300 dark:border-dark-700 hover:border-slate-400 dark:hover:border-dark-600'
                }`}>
                  {enhancement && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <div>
                  <span className="text-xs font-bold block select-none">Contrast stretching</span>
                  <span className="text-[10px] text-slate-400 block select-none mt-0.5">Histogram stretching via CLAHE logic</span>
                </div>
              </div>

            </div>

            {/* Launch prediction trigger button */}
            <div className="mt-8 border-t border-slate-200 dark:border-dark-800 pt-6">
              <button
                type="button"
                onClick={handleStartAnalysis}
                disabled={!file || uploading || predicting}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/10 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                <FiPlayCircle className="w-4 h-4" />
                <span>Execute Pipeline</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default DetectionPage;
