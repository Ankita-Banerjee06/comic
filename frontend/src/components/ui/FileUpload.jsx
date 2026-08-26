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
          setTimeout(() => {
            if (onUpload) onUpload(selectedFile);
          }, 0);
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
              ? 'border-blue-400 bg-blue-100/60'
              : 'border-blue-200 hover:border-blue-300 hover:bg-blue-100/40 bg-blue-50/60'
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
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-500'}`}>
            <UploadCloud className="w-10 h-10" />
          </div>
          <p className="text-lg font-bold text-slate-700 mb-1">{label}</p>
          <p className="text-sm text-slate-400 font-medium text-center max-w-xs">
            Drag and drop your file here, or click to browse. Supported formats based on module.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
          <button
            onClick={clearFile}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-700 truncate max-w-[200px] sm:max-w-md">
                {file.name}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            {progress === 100 && (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>{progress === 100 ? 'Upload complete' : 'Uploading...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
