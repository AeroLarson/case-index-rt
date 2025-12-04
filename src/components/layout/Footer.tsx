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
        padding: '24px 24px 12px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Compact Built With & Powered By */}
        <div className="text-center mb-4">
          <div className="mb-3">
            <p className="text-gray-400 text-xs mb-3">Built with</p>
            <div className="flex justify-center items-center gap-3 sm:gap-4 lg:gap-6 flex-wrap opacity-70">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-gavel text-blue-400 text-sm" />
                <span className="text-gray-300 text-xs font-medium">Clio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fa-brands fa-google text-red-400 text-sm" />
                <span className="text-gray-300 text-xs font-medium">Google Calendar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fa-brands fa-stripe text-purple-400 text-sm" />
                <span className="text-gray-300 text-xs font-medium">Stripe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fa-brands fa-microsoft text-blue-500 text-sm" />
                <span className="text-gray-300 text-xs font-medium">Microsoft Calendar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-robot text-green-400 text-sm" />
                <span className="text-gray-300 text-xs font-medium">AI Integration</span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-700/20">
            <div className="flex justify-center items-center gap-2 opacity-60">
              <span className="text-gray-500 text-xs">Powered by</span>
              <i className="fa-solid fa-cloud text-gray-400 text-sm" />
              <span className="text-gray-400 text-xs font-medium">Vercel</span>
            </div>
          </div>
        </div>

        {/* Copyright - Compact */}
        <div className="text-center pt-4 border-t border-purple-400/10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs text-gray-500">
            <span>&copy; 2025 Case Index RT. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Link href="/privacy" className="text-purple-400 no-underline hover:text-purple-300 transition-colors">Privacy Policy</Link>
              <span>|</span>
              <Link href="/terms" className="text-purple-400 no-underline hover:text-purple-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


