import VideoPlayer from '../components/ui/VideoPlayer';

export default function Video() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">AMIVI Video Player</h1>
        <p className="text-gray-400 mt-2">Watch your generated AI visual concepts.</p>
      </div>

      <VideoPlayer />
      
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-4">Video Details</h2>
        <div className="space-y-4 text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row border-b border-gray-800 pb-4">
            <span className="w-32 shrink-0 font-medium text-gray-500 mb-1 sm:mb-0">Source Text</span>
            <span className="flex-1">Chapter 4: The principles of Quantum Mechanics...</span>
          </div>
          <div className="flex flex-col sm:flex-row border-b border-gray-800 pb-4">
            <span className="w-32 shrink-0 font-medium text-gray-500 mb-1 sm:mb-0">Generated On</span>
            <span className="flex-1">August 3, 2026</span>
          </div>
          <div className="flex flex-col sm:flex-row border-b border-gray-800 pb-4">
            <span className="w-32 shrink-0 font-medium text-gray-500 mb-1 sm:mb-0">Voice Profile</span>
            <span className="flex-1">Piper TTS (English - Default)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
