'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authenticateWithGoogle } from '@/lib/googleAuth'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const googleUser = await authenticateWithGoogle()
      login({
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture
      })
      router.push('/')
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      setError('Failed to sign in with Google. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center animated-aura p-4" style={{
      background: 'linear-gradient(180deg, #0f0520 0%, #1a0b2e 50%, #2d1b4e 100%)',
    }}>
      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Back Button - Mobile Optimized */}
      <button
        onClick={() => router.push('/')}
        className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20 flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-gray-300 hover:text-white hover:bg-slate-800 transition-all group min-h-[48px]"
      >
        <i className="fa-solid fa-arrow-left text-lg group-hover:-translate-x-1 transition-transform"></i>
        <span className="font-medium hidden sm:inline">Back to Home</span>
        <span className="font-medium sm:hidden">Back</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left">
          <div className="mb-8">
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                <i className="fa-solid fa-gavel text-white text-4xl"></i>
              </div>
              <div>
                <h1 className="text-white text-4xl font-bold">Case Index RT</h1>
                <p className="text-purple-300 text-lg">Legal Case Management</p>
              </div>
            </div>
          </div>

          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Your Legal Dashboard<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Simplified
            </span>
          </h2>

          <p className="text-gray-300 text-base md:text-lg lg:text-xl mb-8 leading-relaxed">
            Access comprehensive case data from California courts. Track filings, hearings, 
            and documents in real-time with AI-powered insights.
          </p>

          <div className="space-y-4 hidden lg:block">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <i className="fa-solid fa-database text-blue-400 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-200 text-lg font-semibold">Real-Time Court Data</p>
                <p className="text-gray-400 text-sm">Live county records, constantly updated</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <i className="fa-solid fa-robot text-purple-400 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-200 text-lg font-semibold">AI-Powered Insights</p>
                <p className="text-gray-400 text-sm">Smart case summaries and analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <i className="fa-solid fa-link text-cyan-400 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-200 text-lg font-semibold">Easy Clio Integration</p>
                <p className="text-gray-400 text-sm">Seamless sync with your CRM</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <i className="fa-solid fa-calendar-check text-green-400 text-xl"></i>
              </div>
              <div>
                <p className="text-gray-200 text-lg font-semibold">Automated Calendar</p>
                <p className="text-gray-400 text-sm">Never miss a deadline or hearing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Card */}
        <div>
          <div className="apple-card p-6 md:p-10 max-w-md mx-auto backdrop-blur-2xl" style={{
            background: 'rgba(30, 41, 59, 0.6)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(139, 92, 246, 0.2)'
          }}>
            <div className="text-center mb-6 md:mb-8">
              <h3 className="text-white text-2xl md:text-3xl font-bold mb-3">Welcome Back</h3>
              <p className="text-gray-300 text-base md:text-lg">Sign in to continue to your dashboard</p>
            </div>

            {/* Security Badge */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-shield-check text-blue-400 text-2xl"></i>
                <div>
                  <p className="text-blue-300 font-semibold">Secure Authentication</p>
                  <p className="text-blue-400/70 text-sm">Protected by Google OAuth 2.0</p>
                </div>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 py-4 px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:gap-4 border border-gray-300 shadow-lg hover:shadow-xl min-h-[56px]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-exclamation-triangle text-red-400 text-xl"></i>
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-gray-400 text-sm text-center">
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              <i className="fa-solid fa-lock text-purple-400 mr-2"></i>
              Your data is encrypted and secure
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-20 md:bottom-8 left-0 right-0 text-center px-4">
        <p className="text-gray-500 text-sm">
          © 2025 Case Index RT. All rights reserved.
        </p>
      </div>
    </div>
  )
}
