import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Test Platform-Specific Search
 * This endpoint tests the correct San Diego County platforms with proper rate limits
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = '22FL001581C' // Your real case number
    console.log('🔍 Testing platform-specific search for:', searchQuery)
    
    // Test the updated county data service with correct platforms
    const countyResults = await countyDataService.searchCases(searchQuery, 'caseNumber')
    
    console.log('Platform search results:', countyResults)
    
    // Get rate limit status for each platform
    const roaStatus = countyDataService.getRateLimitStatus('roasearch')
    const odyroaStatus = countyDataService.getRateLimitStatus('odyroa')
    const courtIndexStatus = countyDataService.getRateLimitStatus('courtindex')
    
    return NextResponse.json({
      success: true,
      searchQuery,
      results: countyResults,
      totalResults: countyResults.length,
      rateLimits: {
        roasearch: roaStatus,
        odyroa: odyroaStatus,
        courtIndex: courtIndexStatus
      },
      message: 'Platform-specific search test completed with correct rate limits'
    })
    
  } catch (error) {
    console.error('Platform search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Platform search test failed'
      },
      { status: 500 }
    )
  }
}
