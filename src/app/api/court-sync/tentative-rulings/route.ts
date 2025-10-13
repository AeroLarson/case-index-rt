import { NextRequest, NextResponse } from 'next/server'
import { syncTentativeRulings } from '@/lib/courtDataSync'

export async function POST(request: NextRequest) {
  try {
    const { userId, caseNumbers } = await request.json()
    
    if (!userId || !caseNumbers || !Array.isArray(caseNumbers)) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, caseNumbers' },
        { status: 400 }
      )
    }
    
    // Sync tentative rulings from court systems
    const rulings = await syncTentativeRulings(userId, caseNumbers)
    
    return NextResponse.json({
      success: true,
      rulings,
      count: rulings.length
    })
    
  } catch (error) {
    console.error('Error syncing tentative rulings:', error)
    return NextResponse.json(
      { error: 'Failed to sync tentative rulings' },
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
    
    // Get tentative rulings for specific case
    const rulings = await syncTentativeRulings(userId, [caseNumber])
    
    return NextResponse.json({
      success: true,
      rulings,
      caseNumber
    })
    
  } catch (error) {
    console.error('Error fetching tentative rulings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tentative rulings' },
      { status: 500 }
    )
  }
}
