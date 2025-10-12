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
    console.log('Google OAuth not configured, using simulation mode')
    return simulateGoogleAuth()
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
        initializeGoogleAuth(resolve, reject)
      }
      script.onerror = () => {
        console.log('Failed to load Google Identity Services, using simulation')
        simulateGoogleAuth().then(resolve).catch(reject)
      }
      document.head.appendChild(script)
    } else {
      initializeGoogleAuth(resolve, reject)
    }
  })
}

const initializeGoogleAuth = (resolve: (user: GoogleUser) => void, reject: (error: Error) => void) => {
  try {
    // Use OAuth2 popup flow which is more reliable
    const client = (window.google as any).accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: (response: any) => {
        console.log('Google OAuth response received')
        // Get user info from the access token
        fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
          .then(res => res.json())
          .then(data => {
            console.log('Google user data:', data)
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
            reject(new Error('Failed to get user info from Google'))
          })
      }
    })
    
    console.log('Requesting Google OAuth access token...')
    client.requestAccessToken()

  } catch (error) {
    console.error('Failed to initialize Google OAuth:', error)
    reject(new Error('Failed to initialize Google OAuth'))
  }
}

// Fallback simulation for development
export const simulateGoogleAuth = async (): Promise<GoogleUser> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return a mock user for demo (you can customize this with your info)
  return {
    id: 'google_' + Math.random().toString(36).substr(2, 9),
    name: 'Your Name', // Change this to your name
    email: 'your.email@gmail.com', // Change this to your email
    picture: 'https://via.placeholder.com/40'
  }
}
