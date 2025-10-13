import { NextRequest, NextResponse } from 'next/server'
import { clioAPI } from '@/lib/clioAPI'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')

    // Generate authorization URL
    const authUrl = clioAPI.getAuthorizationUrl(state || undefined)

    // Redirect to Clio OAuth
    return NextResponse.redirect(authUrl)

  } catch (error) {
    console.error('Clio authorization error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Clio authorization' },
      { status: 500 }
    )
  }
}
