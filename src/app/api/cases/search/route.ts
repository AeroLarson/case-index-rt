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
    
    // Return one mock case for Aero Larson testing
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

  } catch (error) {
    console.error('Case search error:', error)
    return NextResponse.json(
      { error: 'Failed to search cases' },
      { status: 500 }
    )
  }
}

