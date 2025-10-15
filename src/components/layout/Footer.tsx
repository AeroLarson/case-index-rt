'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function Footer() {
  const { user } = useAuth()
  
  return (
    <footer 
      id="footer-main"
      className={`border-t border-purple-400/10 ${user ? 'lg:ml-60' : ''}`}
      style={{
        background: '#0f0520',
        padding: '48px 24px 24px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Trusted By Section */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-4">Trusted by Professionals and Teams</p>
          <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-12 flex-wrap opacity-60">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-gavel text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Clio</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-briefcase text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">MyCase</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-balance-scale text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">PracticePanther</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-file-contract text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Smokeball</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">TimeSolv</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-gray-400 text-lg sm:text-xl" />
              <span className="text-gray-400 text-xs sm:text-sm font-medium">Rocket Matter</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-purple-400/10">
          <p className="text-gray-500 text-xs">
            &copy; 2025 Case Index RT. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            <a href="#" className="text-purple-400 no-underline hover:text-purple-300">Privacy Policy</a> |{' '}
            <a href="#" className="text-purple-400 no-underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}


