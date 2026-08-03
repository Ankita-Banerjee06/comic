export function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg animate-pulse w-full">
      <div className="w-full h-48 bg-gray-800 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray-800 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-800 rounded-md w-1/2 mb-6"></div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-800/50">
        <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
        <div className="h-8 bg-gray-800 rounded-md w-24"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ rows = 3 }) {
  return (
    <div className="w-full animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-gray-800 rounded-md ${
            i === rows - 1 ? 'w-2/3' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
}
