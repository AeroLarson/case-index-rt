import { NextRequest, NextResponse } from 'next/server'
import { clioAPI } from '@/lib/clioAPI'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid Clio token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    clioAPI['accessToken'] = token

    const { syncType, data } = await request.json()

    let result

    switch (syncType) {
      case 'matters':
        // Sync cases to Clio matters
        if (Array.isArray(data)) {
          result = []
          for (const caseData of data) {
            const matter = await clioAPI.syncCaseToClio(caseData)
            result.push(matter)
          }
        } else {
          result = await clioAPI.syncCaseToClio(data)
        }
        break

      case 'calendar':
        // Sync calendar events
        result = await clioAPI.syncCalendarEvents(data)
        break

      case 'test':
        // Test connection
        result = await clioAPI.testConnection()
        break

      default:
        return NextResponse.json(
          { error: 'Invalid sync type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      syncType,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error syncing with Clio:', error)
    return NextResponse.json(
      { error: 'Failed to sync with Clio', details: error.message },
      { status: 500 }
    )
  }
}
