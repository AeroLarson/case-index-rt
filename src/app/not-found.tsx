'use client'

import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <main 
      className="min-h-screen flex items-center justify-center animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)'
      }}
    >
      <div className="text-center max-w-md mx-auto px-6">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
            404
          </div>
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-gavel text-white text-4xl"></i>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-white text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to your case management dashboard.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105"
          >
            <i className="fa-solid fa-house mr-2"></i>
            Go to Dashboard
          </button>
          <button
            onClick={() => router.back()}
            className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 border border-white/20"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Go Back
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h3 className="text-white font-semibold text-lg mb-4">Need Help?</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-search text-blue-400"></i>
              <span>Try searching for your case</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-chart-line text-green-400"></i>
              <span>Check your analytics dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-bell text-yellow-400"></i>
              <span>Review your notifications</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
