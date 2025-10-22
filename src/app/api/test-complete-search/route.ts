import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Test Complete Search Flow
 * This endpoint tests the complete search flow from start to finish
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing complete search flow...')
    
    // Test with a common name
    const searchQuery = 'Smith'
    const searchType = 'name'
    
    console.log('Searching for:', searchQuery, 'Type:', searchType)
    
    try {
      // Use the county data service directly
      const results = await countyDataService.searchCases(searchQuery, searchType as any)
      
      console.log('County service returned:', results.length, 'cases')
      
      // Transform results to our format
      const cases = results.map(caseData => ({
        id: `county_${caseData.caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}`,
        caseNumber: caseData.caseNumber,
        title: caseData.caseTitle,
        court: `${caseData.department} - San Diego Superior Court`,
        judge: caseData.judge,
        status: caseData.status,
        lastActivity: caseData.lastActivity,
        parties: {
          plaintiff: caseData.parties[0] || 'Unknown',
          defendant: caseData.parties[1] || 'Unknown'
        },
        documents: caseData.registerOfActions.length,
        hearings: caseData.upcomingEvents.length,
        isDetailed: true,
        caseType: caseData.caseType,
        department: caseData.department,
        courtLocation: 'San Diego Superior Court',
        judicialOfficer: caseData.judge,
        dateFiled: caseData.dateFiled,
        countyData: {
          court: 'San Diego Superior Court',
          department: caseData.department,
          judicialOfficer: caseData.judge,
          caseType: caseData.caseType,
          status: caseData.status,
          lastUpdated: new Date().toISOString(),
          registerOfActions: caseData.registerOfActions,
          upcomingEvents: caseData.upcomingEvents
        }
      }))

      return NextResponse.json({
        success: true,
        searchQuery,
        searchType,
        results: cases,
        total: cases.length,
        rateLimitStatus: countyDataService.getRateLimitStatus(),
        message: `Found ${cases.length} cases for search: ${searchQuery}`
      })
      
    } catch (countyError) {
      console.error('County search failed:', countyError)
      
      return NextResponse.json({
        success: false,
        searchQuery,
        searchType,
        error: countyError instanceof Error ? countyError.message : 'Unknown error',
        message: 'County search failed - check logs for details'
      })
    }

  } catch (error) {
    console.error('Complete search test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Complete search test failed'
      },
      { status: 500 }
    )
  }
}
