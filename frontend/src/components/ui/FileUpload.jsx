import { UploadCloud, File as FileIcon, X, CheckCircle2 } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function FileUpload({ accept = "*", label = "Upload a file", onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    // Simulate upload progress
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onUpload) onUpload(selectedFile);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
            isDragging
              ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
              : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 bg-gray-900/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept={accept}
            onChange={handleChange}
          />
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400'}`}>
            <UploadCloud className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium text-gray-200 mb-1">{label}</p>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Drag and drop your file here, or click to browse. Supported formats based on module.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <button 
            onClick={clearFile}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-xl">
              <FileIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-200 truncate max-w-[200px] sm:max-w-md">
                {file.name}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {progress === 100 && (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
              <span>{progress === 100 ? 'Upload complete' : 'Uploading...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
