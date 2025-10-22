import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Test Fixed Search
 * This endpoint tests the fixed county search with real case data
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = '22FL001581C' // Your real case number
    console.log('🔍 Testing fixed county search for:', searchQuery)
    
    // Test the fixed county data service
    const countyResults = await countyDataService.searchCases(searchQuery, 'caseNumber')
    
    console.log('County search results:', countyResults)
    
    return NextResponse.json({
      success: true,
      searchQuery,
      results: countyResults,
      totalResults: countyResults.length,
      message: 'Fixed county search test completed'
    })
    
  } catch (error) {
    console.error('Fixed search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Fixed search test failed'
      },
      { status: 500 }
    )
  }
}
