// Google OAuth configuration and utilities
import { GoogleAuth } from 'google-auth-library'

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '396289966347-6hrfkbf1ttgep9kbrtuptfb151h85j1v.apps.googleusercontent.com'

export interface GoogleUser {
  id: string
  name: string
  email: string
  picture?: string
}

// Real Google OAuth implementation with fallback
export const authenticateWithGoogle = async (): Promise<GoogleUser> => {
  if (typeof window === 'undefined') {
    throw new Error('Google OAuth must be called from client side')
  }

  // Check if Google OAuth is not properly configured
  if (GOOGLE_CLIENT_ID === 'your-google-client-id') {
    console.error('Google OAuth not configured - NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
    throw new Error('Google OAuth is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.')
  }

  console.log('Using real Google OAuth with Client ID:', GOOGLE_CLIENT_ID)

  return new Promise((resolve, reject) => {
    // Load Google Identity Services
    if (!window.google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => {
        // Add a delay to ensure Google is fully initialized
        setTimeout(() => {
          if (window.google && (window.google as any).accounts) {
            initializeGoogleAuth(resolve, reject)
          } else {
            // Try again after a longer delay
            setTimeout(() => {
              if (window.google && (window.google as any).accounts) {
                initializeGoogleAuth(resolve, reject)
              } else {
                reject(new Error('Google Identity Services loaded but not initialized. Please refresh the page and try again.'))
              }
            }, 500)
          }
        }, 200)
      }
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script')
        reject(new Error('Failed to load Google Identity Services. Please check your internet connection and try again.'))
      }
      document.head.appendChild(script)
    } else {
      initializeGoogleAuth(resolve, reject)
    }
  })
}

const initializeGoogleAuth = (resolve: (user: GoogleUser) => void, reject: (error: Error) => void) => {
  try {
    // Check if Google Identity Services is available
    if (!window.google || !(window.google as any).accounts) {
      console.error('Google Identity Services not loaded')
      reject(new Error('Google Identity Services failed to load. Please refresh the page and try again.'))
      return
    }

    // Use OAuth2 popup flow which is more reliable
    const client = (window.google as any).accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: (response: any) => {
        console.log('Google OAuth response received')
        
        if (response.error) {
          console.error('Google OAuth error:', response.error)
          reject(new Error(`Google OAuth error: ${response.error}`))
          return
        }
        
        if (!response.access_token) {
          console.error('No access token received from Google')
          reject(new Error('No access token received from Google'))
          return
        }
        
        // Get user info from the access token
        fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch user info: ${res.status} ${res.statusText}`)
            }
            return res.json()
          })
          .then(data => {
            console.log('Google user data:', data)
            
            if (!data.id || !data.name || !data.email) {
              throw new Error('Invalid user data received from Google')
            }
            
            const user: GoogleUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              picture: data.picture
            }
            resolve(user)
          })
          .catch((error) => {
            console.error('Failed to get user info from Google:', error)
            reject(new Error(`Failed to get user info from Google: ${error.message}`))
          })
      },
      error_callback: (error: any) => {
        console.error('Google OAuth error callback:', error)
        reject(new Error(`Google OAuth error: ${error.type || 'Unknown error'}`))
      }
    })
    
    console.log('Requesting Google OAuth access token...')
    client.requestAccessToken()

  } catch (error: any) {
    console.error('Failed to initialize Google OAuth:', error)
    reject(new Error(`Failed to initialize Google OAuth: ${error.message || 'Unknown error'}`))
  }
}

// Fallback simulation for development/testing
const simulateGoogleAuth = async (): Promise<GoogleUser> => {
  console.log('Using Google OAuth simulation mode')
  
  // Simulate a delay for realistic behavior
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    id: `sim_${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    picture: 'https://via.placeholder.com/150'
  }
}

