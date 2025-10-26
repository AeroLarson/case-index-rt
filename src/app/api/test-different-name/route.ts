import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Test Different Name Search
 * This endpoint tests searching with different names to see if we get real data
 */
export async function GET(request: NextRequest) {
  try {
    const searchQueries = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis']
    const results = []
    
    for (const query of searchQueries) {
      console.log(`🔍 Testing search for: ${query}`)
      
      try {
        const countyResults = await countyDataService.searchCases(query, 'name')
        results.push({
          searchQuery: query,
          results: countyResults,
          totalResults: countyResults.length,
          hasRealData: countyResults.some(r => 
            r.parties.some(party => party.toLowerCase().includes(query.toLowerCase())) ||
            r.caseTitle.toLowerCase().includes(query.toLowerCase())
          ),
          isSampleData: countyResults.some(r => r.caseTitle.includes('Larson'))
        })
      } catch (error) {
        results.push({
          searchQuery: query,
          error: error instanceof Error ? error.message : 'Unknown error',
          results: [],
          totalResults: 0
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      searchQueries,
      results,
      message: 'Different name search test completed'
    })
    
  } catch (error) {
    console.error('Different name search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Different name search test failed'
      },
      { status: 500 }
    )
  }
}
