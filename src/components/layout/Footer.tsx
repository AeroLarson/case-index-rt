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
        padding: '32px 24px 16px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Built With & Powered By Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-4">Built with</p>
            <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap opacity-70">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gavel text-blue-400 text-lg sm:text-xl" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium">Clio</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-brands fa-google text-red-400 text-lg sm:text-xl" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium">Google Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-brands fa-stripe text-purple-400 text-lg sm:text-xl" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium">Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-brands fa-microsoft text-blue-500 text-lg sm:text-xl" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium">Microsoft Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-robot text-green-400 text-lg sm:text-xl" />
                <span className="text-gray-300 text-xs sm:text-sm font-medium">AI Integration</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700/20">
            <p className="text-gray-500 text-xs mb-2">Powered by</p>
            <div className="flex justify-center items-center gap-2 opacity-60">
              <i className="fa-solid fa-cloud text-gray-400 text-lg" />
              <span className="text-gray-400 text-xs font-medium">Vercel</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-purple-400/10">
          <p className="text-gray-500 text-xs">
            &copy; 2025 Case Index RT. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            <a href="/privacy" className="text-purple-400 no-underline hover:text-purple-300 transition-colors">Privacy Policy</a> |{' '}
            <a href="/terms" className="text-purple-400 no-underline hover:text-purple-300 transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}


