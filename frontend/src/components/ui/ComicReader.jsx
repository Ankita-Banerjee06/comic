import { ChevronLeft, ChevronRight, Maximize2, Download, BookOpen, Pencil, RefreshCw, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { mediaUrl, downloadMedia } from '../../services/api';

export default function ComicReader({
  panels = [],
  onEdit,
  onRegenerate,
  onRemove,
  onAdd,
  busyPanelNumber = null,
  canRemove = true,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!panels || panels.length === 0) return null;

  const safeIndex = Math.min(currentIndex, panels.length - 1);
  const currentPanel = panels[safeIndex];
  const imageUrl = mediaUrl(currentPanel.image_url);
  const isBusy = busyPanelNumber === currentPanel.panel_number;

  const handleDownload = () => {
    downloadMedia(currentPanel.image_url, `panel-${currentPanel.panel_number}.png`);
  };

  const handleMaximize = () => {
    if (imageUrl) window.open(imageUrl, '_blank');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
      {/* Header Toolbar */}
      <div className="h-14 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-200">Generated Comic</h3>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400 font-medium bg-gray-800 px-3 py-1 rounded-full">
            Panel {safeIndex + 1} of {panels.length}
          </span>
          <div className="w-px h-6 bg-gray-800 mx-2"></div>
          <button onClick={handleDownload} title="Download this panel" className="text-gray-400 hover:text-fuchsia-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
            <Download className="w-5 h-5" />
          </button>
          <button onClick={handleMaximize} title="Open full size" className="text-gray-400 hover:text-fuchsia-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
            <Maximize2 className="w-5 h-5" />
          </button>
          {onEdit && (
            <button onClick={() => onEdit(currentPanel)} title="Edit dialogue" className="text-gray-400 hover:text-fuchsia-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
              <Pencil className="w-5 h-5" />
            </button>
          )}
          {onRegenerate && (
            <button onClick={() => onRegenerate(currentPanel)} disabled={isBusy} title="Regenerate this panel's image" className="text-gray-400 hover:text-fuchsia-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40">
              <RefreshCw className={`w-5 h-5 ${isBusy ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onRemove && (
            <button onClick={() => onRemove(currentPanel)} disabled={!canRemove} title="Remove this panel" className="text-gray-400 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-30">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          {onAdd && (
            <button onClick={() => onAdd(currentPanel)} title="Add a new panel after this one" className="text-gray-400 hover:text-emerald-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 relative bg-[#0f1115] flex items-center justify-center p-8">
        <button
          onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
          disabled={safeIndex === 0}
          className="absolute left-6 z-10 p-3 rounded-full bg-gray-900/80 border border-gray-700 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Comic Panel */}
        <div className="h-full max-w-3xl aspect-[4/3] bg-white rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white flex flex-col relative overflow-hidden group">
          <img
            src={imageUrl}
            alt={`Panel ${safeIndex + 1}`}
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-2 right-4 font-bold text-white drop-shadow-md text-sm">{safeIndex + 1}</div>

          {isBusy && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentIndex(p => Math.min(panels.length - 1, p + 1))}
          disabled={safeIndex === panels.length - 1}
          className="absolute right-6 z-10 p-3 rounded-full bg-gray-900/80 border border-gray-700 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
