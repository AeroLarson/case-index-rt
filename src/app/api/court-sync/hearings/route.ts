import { NextRequest, NextResponse } from 'next/server'
import { syncCourtHearings } from '@/lib/courtDataSync'

export async function POST(request: NextRequest) {
  try {
    const { userId, caseNumbers } = await request.json()
    
    if (!userId || !caseNumbers || !Array.isArray(caseNumbers)) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, caseNumbers' },
        { status: 400 }
      )
    }
    
    // Sync hearings from court systems
    const hearings = await syncCourtHearings(userId, caseNumbers)
    
    return NextResponse.json({
      success: true,
      hearings,
      count: hearings.length
    })
    
  } catch (error) {
    console.error('Error syncing court hearings:', error)
    return NextResponse.json(
      { error: 'Failed to sync court hearings' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const caseNumber = searchParams.get('caseNumber')
    
    if (!userId || !caseNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, caseNumber' },
        { status: 400 }
      )
    }
    
    // Get hearings for specific case
    const hearings = await syncCourtHearings(userId, [caseNumber])
    
    return NextResponse.json({
      success: true,
      hearings,
      caseNumber
    })
    
  } catch (error) {
    console.error('Error fetching court hearings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch court hearings' },
      { status: 500 }
    )
  }
}
