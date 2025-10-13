'use client'

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'dashboard' | 'search'
  count?: number
}

export default function LoadingSkeleton({ type = 'card', count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="apple-card p-6 animate-pulse">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-slate-700/50 rounded w-full mb-2"></div>
            <div className="h-3 bg-slate-700/50 rounded w-5/6 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-slate-700/50 rounded w-20"></div>
              <div className="h-8 bg-slate-700/50 rounded w-20"></div>
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg animate-pulse">
            <div className="w-12 h-12 bg-slate-700/50 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
            </div>
          </div>
        )
      
      case 'text':
        return (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-slate-700/50 rounded w-full"></div>
            <div className="h-3 bg-slate-700/50 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700/50 rounded w-4/6"></div>
          </div>
        )
      
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="apple-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-slate-700/50 rounded w-1/2"></div>
                  <div className="w-10 h-10 bg-slate-700/50 rounded-full"></div>
                </div>
                <div className="h-8 bg-slate-700/50 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )
      
      case 'search':
        return (
          <div className="apple-card p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-700/50 rounded"></div>
              <div className="flex-1">
                <div className="h-5 bg-slate-700/50 rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-700/50 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-700/50 rounded w-5/6 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-700/50 rounded-full w-16"></div>
                  <div className="h-6 bg-slate-700/50 rounded-full w-20"></div>
                  <div className="h-6 bg-slate-700/50 rounded-full w-24"></div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}

