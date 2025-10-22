import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Auto-update tracked cases
 * This endpoint updates all tracked cases with latest county data
 */
export async function POST(request: NextRequest) {
  try {
    const { trackedCases } = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!trackedCases || !Array.isArray(trackedCases) || trackedCases.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No tracked cases to update',
        updatedCases: []
      })
    }

    console.log(`Auto-updating ${trackedCases.length} tracked cases for user: ${userId}`)

    try {
      // Update all tracked cases with latest county data
      const updatedCases = await countyDataService.updateTrackedCases(trackedCases)
      
      // Transform updated cases to our format
      const cases = updatedCases.map(caseData => ({
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
        updatedCases: cases,
        total: cases.length,
        source: 'san_diego_county_auto_update',
        rateLimitStatus: countyDataService.getRateLimitStatus(),
        timestamp: new Date().toISOString()
      })

    } catch (countyError) {
      console.error('Auto-update failed:', countyError)
      
      return NextResponse.json({
        success: false,
        error: 'Auto-update failed',
        countyError: countyError instanceof Error ? countyError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Auto-update error:', error)
    return NextResponse.json(
      { error: 'Failed to auto-update cases' },
      { status: 500 }
    )
  }
}
