import { NextRequest, NextResponse } from 'next/server'
import { clioAPI } from '@/lib/clioAPI'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user's stored Clio tokens from the database
    // For now, we'll return mock data if no token is available
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid Clio token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    clioAPI['accessToken'] = token // Set the token for this request

    const matters = await clioAPI.getMatters()
    
    return NextResponse.json({
      success: true,
      data: matters
    })

  } catch (error) {
    console.error('Error fetching Clio matters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matters from Clio' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid Clio token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    clioAPI['accessToken'] = token

    const matterData = await request.json()
    const matter = await clioAPI.syncCaseToClio(matterData)
    
    return NextResponse.json({
      success: true,
      data: matter
    })

  } catch (error) {
    console.error('Error creating Clio matter:', error)
    return NextResponse.json(
      { error: 'Failed to create matter in Clio' },
      { status: 500 }
    )
  }
}
