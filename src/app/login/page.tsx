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
      console.log('Starting Google sign-in process...')
      console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
      
      // Check if Google Client ID is configured
      if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID === 'your-google-client-id') {
        setError('Google OAuth is not configured. Please set up your Google Client ID in .env.local')
        setIsLoading(false)
        return
      }

      console.log('Calling authenticateWithGoogle...')
      const googleUser = await authenticateWithGoogle()
      console.log('Google user received:', googleUser)
      
      login({
        id: googleUser.id,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture
      })
      router.push('/')
    } catch (err: any) {
      console.error('Google sign-in error:', err)
      if (err.message?.includes('not configured')) {
        setError('Google OAuth is not configured. Please check the setup guide.')
      } else {
        setError('Failed to sign in with Google. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center animated-aura" style={{
      background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
      paddingTop: '20px'
    }}>
      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <i className="fa-solid fa-gavel text-purple-400 text-3xl" />
            <span className="text-white text-2xl font-bold">Case Index RT</span>
          </div>
          <p className="text-gray-300 text-lg">Legal Case Management Platform</p>
        </div>

        {/* Main Card */}
        <div className="apple-card p-6">
          <div className="text-center mb-6">
            <h1 className="text-white text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to access your legal dashboard</p>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center mb-2">
              <i className="fa-solid fa-shield-check text-blue-400 text-lg mr-2"></i>
              <span className="text-blue-400 font-medium">Secure Authentication</span>
            </div>
            <p className="text-blue-300 text-sm text-center">
              This platform requires Google OAuth authentication for security. 
              Please use your Google account to sign in.
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-gray-300"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center">
                <i className="fa-solid fa-exclamation-triangle text-red-400 mr-2"></i>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          {error && error.includes('not configured') && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="text-yellow-400 font-medium mb-2">Setup Required</h3>
              <p className="text-yellow-300 text-sm mb-2">
                To enable Google OAuth authentication:
              </p>
              <ol className="text-yellow-300 text-sm list-decimal list-inside space-y-1">
                <li>Create a Google Cloud Project</li>
                <li>Enable Google+ API</li>
                <li>Create OAuth 2.0 credentials</li>
                <li>Add your domain to authorized origins</li>
                <li>Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local</li>
              </ol>
              <p className="text-yellow-300 text-sm mt-2">
                See <code className="bg-yellow-500/20 px-1 rounded">GOOGLE_OAUTH_SETUP.md</code> for detailed instructions.
              </p>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-center space-x-6 text-sm">
              <a href="/privacy" className="text-gray-400 hover:text-gray-300 transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-gray-300 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}