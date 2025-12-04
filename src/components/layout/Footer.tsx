'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Footer() {
  const { user } = useAuth()
  
  return (
      <footer 
      id="footer-main"
      className={`border-t border-purple-400/10 ${user ? 'lg:ml-60' : ''}`}
      style={{
        background: '#0f0520',
        padding: '20px 16px 12px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Compact Built With & Powered By */}
        <div className="text-center mb-3 sm:mb-4">
          <div className="mb-2 sm:mb-3">
            <p className="text-gray-400 text-xs mb-2 sm:mb-3">Built with</p>
            <div className="flex justify-center items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-wrap opacity-70 px-2">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fa-solid fa-gavel text-blue-400 text-xs sm:text-sm" />
                <span className="text-gray-300 text-xs font-medium">Clio</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fa-brands fa-google text-red-400 text-xs sm:text-sm" />
                <span className="text-gray-300 text-xs font-medium hidden sm:inline">Google Calendar</span>
                <span className="text-gray-300 text-xs font-medium sm:hidden">Google</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fa-brands fa-stripe text-purple-400 text-xs sm:text-sm" />
                <span className="text-gray-300 text-xs font-medium">Stripe</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fa-brands fa-microsoft text-blue-500 text-xs sm:text-sm" />
                <span className="text-gray-300 text-xs font-medium hidden md:inline">Microsoft Calendar</span>
                <span className="text-gray-300 text-xs font-medium md:hidden">MS Calendar</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <i className="fa-solid fa-robot text-green-400 text-xs sm:text-sm" />
                <span className="text-gray-300 text-xs font-medium hidden sm:inline">AI Integration</span>
                <span className="text-gray-300 text-xs font-medium sm:hidden">AI</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700/20">
            <div className="flex justify-center items-center gap-1.5 sm:gap-2 opacity-60">
              <span className="text-gray-500 text-xs">Powered by</span>
              <i className="fa-solid fa-cloud text-gray-400 text-xs sm:text-sm" />
              <span className="text-gray-400 text-xs font-medium">Vercel</span>
            </div>
          </div>
        </div>

        {/* Copyright - Compact */}
        <div className="text-center pt-3 sm:pt-4 border-t border-purple-400/10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-1.5 sm:gap-2 text-xs text-gray-500 px-2">
            <span className="text-center">&copy; 2025 Case Index RT. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/privacy" className="text-purple-400 no-underline hover:text-purple-300 transition-colors text-xs">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms" className="text-purple-400 no-underline hover:text-purple-300 transition-colors text-xs">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


