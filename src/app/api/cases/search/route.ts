import { NextRequest, NextResponse } from 'next/server'

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

    console.log(`Searching for: "${query}" by user: ${userId}`)

    // TODO: Integrate with actual San Diego County Court API
    // This endpoint will be connected to real court data sources
    
    console.log(`Searching for: "${query}" by user: ${userId}`)
    
    // Only return results for specific searches that match our test case
    const searchQuery = query.trim().toLowerCase()
    
    // Check if search matches our test case criteria
    const matchesCaseNumber = searchQuery === 'fl-2024-001234' || searchQuery === 'fl2024001234'
    const matchesPlaintiff = searchQuery.includes('aero') && searchQuery.includes('larson')
    const matchesDefendant = searchQuery.includes('test') && searchQuery.includes('defendant')
    const matchesCaseTitle = searchQuery.includes('larson') && searchQuery.includes('test')
    
    if (matchesCaseNumber || matchesPlaintiff || matchesDefendant || matchesCaseTitle) {
      // Return the test case only for matching searches
      const mockCase = {
        id: 'case_aero_larson_test',
        caseNumber: 'FL-2024-001234',
        title: 'Larson v. Test Defendant - Dissolution with Minor Children',
        court: 'San Diego Superior Court - Central (Department 602)',
        judge: 'Hon. Rebecca Kanter',
        status: 'Active - Post-Judgment Proceedings',
        lastActivity: 'October 15, 2024',
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
        dateFiled: '2024-03-15',
        countyData: {
          court: 'San Diego Superior Court',
          department: 'Department 602',
          judicialOfficer: 'Hon. Rebecca Kanter',
          caseType: 'Family Law',
          status: 'Active',
          lastUpdated: new Date().toISOString()
        }
      }
      
      return NextResponse.json({
        success: true,
        cases: [mockCase],
        total: 1,
        source: 'test_data'
      })
    } else {
      // Return empty results for non-matching searches
      return NextResponse.json({
        success: true,
        cases: [],
        total: 0,
        message: 'No cases found matching your search criteria',
        source: 'test_data'
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

