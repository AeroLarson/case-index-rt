import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Test Comprehensive Search
 * This endpoint tests the new comprehensive case database without authentication
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = '22FL001581C'
    console.log('🔍 Testing comprehensive case database for:', searchQuery)
    
    const countyResults = await countyDataService.searchCases(searchQuery, 'caseNumber')
    
    return NextResponse.json({
      success: true,
      searchQuery,
      results: countyResults,
      totalResults: countyResults.length,
      message: 'Comprehensive case database test completed',
      features: {
        hasComprehensiveData: countyResults.some(r => r.upcomingEvents.length > 0 || r.registerOfActions.length > 0),
        hasUpgradeOptions: countyResults.some(r => r.upgradeOptions),
        hasPremiumFeatures: countyResults.some(r => r.upgradeOptions?.premium),
        sampleData: countyResults.map(r => ({
          caseNumber: r.caseNumber,
          caseTitle: r.caseTitle,
          hasEvents: r.upcomingEvents.length > 0,
          hasActions: r.registerOfActions.length > 0,
          hasUpgrade: !!r.upgradeOptions
        }))
      }
    })
    
  } catch (error) {
    console.error('Comprehensive search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Comprehensive search test failed'
      },
      { status: 500 }
    )
  }
}
