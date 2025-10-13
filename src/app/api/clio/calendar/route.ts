import { NextRequest, NextResponse } from 'next/server'
import { clioAPI } from '@/lib/clioAPI'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid Clio token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    clioAPI['accessToken'] = token

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const events = await clioAPI.getCalendarEvents(startDate || undefined, endDate || undefined)
    
    return NextResponse.json({
      success: true,
      data: events
    })

  } catch (error) {
    console.error('Error fetching Clio calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events from Clio' },
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

    const eventData = await request.json()
    const event = await clioAPI.createCalendarEvent(eventData)
    
    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Error creating Clio calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event in Clio' },
      { status: 500 }
    )
  }
}
