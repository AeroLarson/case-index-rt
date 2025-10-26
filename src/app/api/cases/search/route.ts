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
      
      // Fallback to test data for development
      const searchQuery = query.trim().toLowerCase()
      
      // Check if search matches our test case criteria
      const matchesCaseNumber = searchQuery === 'fl-2024-001234' || searchQuery === 'fl2024001234'
      const matchesPlaintiff = searchQuery.includes('aero') && searchQuery.includes('larson')
      const matchesDefendant = searchQuery.includes('test') && searchQuery.includes('defendant')
      const matchesCaseTitle = searchQuery.includes('larson') && searchQuery.includes('test')
      
      // John Doe case matches
      const matchesJohnDoe = searchQuery.includes('john') && searchQuery.includes('doe')
      const matchesJohnDoeCaseNumber = searchQuery === 'fl-2024-005678' || searchQuery === 'fl2024005678'
      
      if (matchesCaseNumber || matchesPlaintiff || matchesDefendant || matchesCaseTitle || matchesJohnDoe || matchesJohnDoeCaseNumber) {
        // Determine which case to return based on search
        let mockCase
        
        if (matchesJohnDoe || matchesJohnDoeCaseNumber) {
          // John Doe case
          mockCase = {
            id: 'case_john_doe_criminal',
            caseNumber: 'FL-2024-005678',
            title: 'People v. John Doe - Criminal Case',
            court: 'San Diego Superior Court - Central (Department 703)',
            judge: 'Hon. Michael Rodriguez',
            status: 'Active - Pre-Trial Proceedings',
            lastActivity: 'January 15, 2025',
            parties: {
              plaintiff: 'People of the State of California (Prosecution)',
              defendant: 'John Doe (Defendant)'
            },
            documents: 15,
            hearings: 4,
            isDetailed: true,
            caseType: 'Criminal',
            department: 'Department 703',
            courtLocation: 'San Diego Superior Court - Central',
            judicialOfficer: 'Hon. Michael Rodriguez',
            dateFiled: '2025-01-10',
            countyData: {
              court: 'San Diego Superior Court',
              department: 'Department 703',
              judicialOfficer: 'Hon. Michael Rodriguez',
              caseType: 'Criminal',
              status: 'Active',
              lastUpdated: new Date().toISOString()
            }
          }
        } else {
          // Aero Larson case
          mockCase = {
            id: 'case_aero_larson_test',
            caseNumber: 'FL-2024-001234',
            title: 'Larson v. Test Defendant - Dissolution with Minor Children',
            court: 'San Diego Superior Court - Central (Department 602)',
            judge: 'Hon. Rebecca Kanter',
            status: 'Active - Post-Judgment Proceedings',
            lastActivity: 'January 20, 2025',
            parties: {
              plaintiff: 'Aero Larson (Petitioner)',
              defendant: 'Test Defendant (Respondent)'
            },
            documents: 23,
            hearings: 7,
            isDetailed: true,
            caseType: 'Family Law',
            department: 'Department 602',
            courtLocation: 'San Diego Superior Court - Central',
            judicialOfficer: 'Hon. Rebecca Kanter',
            dateFiled: '2025-01-05',
            countyData: {
              court: 'San Diego Superior Court',
              department: 'Department 602',
              judicialOfficer: 'Hon. Rebecca Kanter',
              caseType: 'Family Law',
              status: 'Active',
              lastUpdated: new Date().toISOString()
            }
          }
        }
        
        return NextResponse.json({
          success: true,
          cases: [mockCase],
          total: 1,
          source: 'test_data_fallback',
          countyError: countyError instanceof Error ? countyError.message : 'Unknown error'
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      } else {
        // Return empty results for non-matching searches
        return NextResponse.json({
          success: true,
          cases: [],
          total: 0,
          message: 'No cases found matching your search criteria',
          source: 'test_data_fallback',
          countyError: countyError instanceof Error ? countyError.message : 'Unknown error'
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      }
    }

  } catch (error) {
    console.error('Case search error:', error)
    return NextResponse.json(
      { error: 'Failed to search cases' },
      { status: 500 }
    )
  }
}

