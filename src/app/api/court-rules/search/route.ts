import { NextRequest, NextResponse } from 'next/server'
import { searchCourtRules } from '@/lib/courtDataSync'

export async function POST(request: NextRequest) {
  try {
    const { county, practiceArea, searchQuery } = await request.json()
    
    if (!county || !practiceArea || !searchQuery) {
      return NextResponse.json(
        { error: 'Missing required fields: county, practiceArea, searchQuery' },
        { status: 400 }
      )
    }
    
    // Search court rules using AI
    const results = await searchCourtRules(county, practiceArea, searchQuery)
    
    return NextResponse.json({
      success: true,
      results,
      searchQuery,
      county,
      practiceArea
    })
    
  } catch (error) {
    console.error('Error searching court rules:', error)
    return NextResponse.json(
      { error: 'Failed to search court rules' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const county = searchParams.get('county')
    const practiceArea = searchParams.get('practiceArea')
    const searchQuery = searchParams.get('searchQuery')
    
    if (!county || !practiceArea || !searchQuery) {
      return NextResponse.json(
        { error: 'Missing required parameters: county, practiceArea, searchQuery' },
        { status: 400 }
      )
    }
    
    // Search court rules using AI
    const results = await searchCourtRules(county, practiceArea, searchQuery)
    
    return NextResponse.json({
      success: true,
      results,
      searchQuery,
      county,
      practiceArea
    })
    
  } catch (error) {
    console.error('Error searching court rules:', error)
    return NextResponse.json(
      { error: 'Failed to search court rules' },
      { status: 500 }
    )
  }
}
