import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

export async function POST(request: NextRequest) {
  try {
    const { caseNumber } = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!caseNumber || !caseNumber.trim()) {
      return NextResponse.json({ error: 'Case number is required' }, { status: 400 })
    }

    console.log(`Fetching details for case: ${caseNumber} by user: ${userId}`)

    // Try to fetch real case data from San Diego County
    try {
      const caseData = await countyDataService.getCaseDetails(caseNumber.trim())
      
      if (caseData) {
        // Transform to the expected format
        const caseDetails = {
          caseNumber: caseData.caseNumber,
          title: caseData.caseTitle,
          court: `${caseData.department} - San Diego Superior Court`,
          judge: caseData.judge || 'Unknown',
          status: caseData.status,
          lastActivity: caseData.lastActivity,
          parties: {
            plaintiff: caseData.parties[0] || 'Unknown',
            defendant: caseData.parties[1] || 'Unknown'
          },
          documents: caseData.registerOfActions.length,
          hearings: caseData.upcomingEvents.length,
          isDetailed: true,
          detailedInfo: {
            caseNumber: caseData.caseNumber,
            title: caseData.caseTitle,
            court: `${caseData.department} - San Diego Superior Court`,
            judge: caseData.judge || 'Unknown',
            status: caseData.status,
            lastActivity: caseData.lastActivity,
            parties: {
              plaintiff: caseData.parties[0] || 'Unknown',
              defendant: caseData.parties[1] || 'Unknown'
            },
            caseHistory: caseData.registerOfActions.map((action: any) => ({
              date: action.date,
              event: action.action,
              description: action.description || action.action,
              filedBy: action.filedBy || 'Court'
            })),
            upcomingEvents: caseData.upcomingEvents.map((event: any) => ({
              date: event.date,
              time: event.time,
              event: event.eventType,
              location: event.description || event.department
            }))
          },
          countyData: {
            court: 'San Diego Superior Court',
            department: caseData.department,
            judicialOfficer: caseData.judge || 'Unknown',
            caseType: caseData.caseType,
            status: caseData.status,
            lastUpdated: new Date().toISOString(),
            registerOfActions: caseData.registerOfActions.map((action: any) => ({
              date: action.date,
              action: action.action,
              description: action.description || action.action,
              filedBy: action.filedBy || 'Court'
            })),
            upcomingEvents: caseData.upcomingEvents.map((event: any) => ({
              date: event.date,
              time: event.time,
              eventType: event.eventType,
              description: event.description || `${event.eventType} at ${event.department}`
            }))
          }
        }
        
        return NextResponse.json({
          success: true,
          caseDetails: caseDetails,
          source: 'san_diego_county'
        })
      }
    } catch (countyError) {
      console.error(`⚠️ Could not fetch from county service for ${caseNumber}:`, countyError)
      
      // Return error response - no test data fallback in production
      return NextResponse.json({
        success: false,
        error: 'Case details not available. The case may not exist in San Diego County records, or there may be a temporary issue accessing the court database. Please verify the case number and try again.',
        source: 'san_diego_county',
        countyError: countyError instanceof Error ? countyError.message : 'Unknown error'
      }, { status: 404 })
    }
    
    // No test data fallback - return error if case not found
    return NextResponse.json({
      success: false,
      error: 'Case details not found. Please verify the case number and try again.'
    }, { status: 404 })

  } catch (error) {
    console.error('Case details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    )
  }
}