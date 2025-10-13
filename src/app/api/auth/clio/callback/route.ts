import { NextRequest, NextResponse } from 'next/server'
import { clioAPI } from '@/lib/clioAPI'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth error
    if (error) {
      console.error('Clio OAuth error:', error)
      return NextResponse.redirect(
        new URL('/account?tab=integrations&error=clio_auth_failed', request.url)
      )
    }

    // Handle missing authorization code
    if (!code) {
      console.error('No authorization code received from Clio')
      return NextResponse.redirect(
        new URL('/account?tab=integrations&error=no_code', request.url)
      )
    }

    // Exchange authorization code for access token
    const tokenData = await clioAPI.getAccessToken(code)

    // Test the connection
    const isConnected = await clioAPI.testConnection()

    if (!isConnected) {
      console.error('Failed to establish Clio connection after token exchange')
      return NextResponse.redirect(
        new URL('/account?tab=integrations&error=connection_failed', request.url)
      )
    }

    // Store tokens securely (in a real app, you'd store these in a database)
    // For now, we'll return success and let the frontend handle the state
    const successUrl = new URL('/account?tab=integrations&success=clio_connected', request.url)
    
    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error('Clio OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/account?tab=integrations&error=oauth_callback_failed', request.url)
    )
  }
}
