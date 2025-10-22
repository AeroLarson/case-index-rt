import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Debug Case Search
 * This endpoint tests the search functionality step by step
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'test' // Simple test query
    console.log('Debugging case search with query:', searchQuery)
    
    // Test 1: Try the county data service directly
    console.log('Step 1: Testing county data service...')
    try {
      const results = await countyDataService.searchCases(searchQuery, 'name')
      console.log('County service results:', results.length, 'cases found')
      
      return NextResponse.json({
        success: true,
        searchQuery,
        results: results,
        total: results.length,
        message: 'County service test completed'
      })
    } catch (error) {
      console.error('County service error:', error)
      
      return NextResponse.json({
        success: false,
        searchQuery,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'County service test failed'
      })
    }

  } catch (error) {
    console.error('Debug search error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Debug search failed'
      },
      { status: 500 }
    )
  }
}
