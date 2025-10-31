import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

export async function POST(request: NextRequest) {
  try {
    const { query, searchType } = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    console.log(`Searching San Diego County records for: "${query}" by user: ${userId}, type: ${searchType}`)

    try {
      // Search real San Diego County court data with comprehensive search
      console.log(`🔍 Searching San Diego County for: "${query}" (${searchType})`)
      const countyResults = await countyDataService.searchCases(query.trim(), searchType as any)
      
      console.log(`✅ Found ${countyResults.length} cases from San Diego County`)
      
      // Transform county data to our format
      const cases = countyResults.map(caseData => ({
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
        note: caseData.note, // Include any notes about data access
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

      // Get rate limit status for all platforms
      const rateLimitStatus = {
        roasearch: countyDataService.getRateLimitStatus('roasearch'),
        odyroa: countyDataService.getRateLimitStatus('odyroa'),
        courtIndex: countyDataService.getRateLimitStatus('courtindex')
      }

      return NextResponse.json({
        success: true,
        cases,
        total: cases.length,
        source: 'san_diego_county',
        searchType,
        rateLimitStatus,
        message: cases.length > 0 ? `Found ${cases.length} case(s) in San Diego County` : 'No cases found matching your search criteria'
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })

    } catch (countyError) {
      console.error('County data search failed:', countyError)
      // Return empty results with explicit source to avoid any fake data
      return NextResponse.json({
        success: true,
        cases: [],
        total: 0,
        source: 'san_diego_county',
        countyError: countyError instanceof Error ? countyError.message : 'Unknown error'
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

  } catch (error) {
    console.error('Case search error:', error)
    return NextResponse.json(
      { error: 'Failed to search cases' },
      { status: 500 }
    )
  }
}

