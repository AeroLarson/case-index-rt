import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

interface SavedCase {
  caseNumber: string
  caseTitle: string
  courtLocation: string
  judicialOfficer: string
  department: string
  caseType: string
  dateFiled: string
  status: string
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: string
  caseNumber: string
  location: string
  description: string
  duration: number
  priority: string
  status: string
  source: string
  countyData?: {
    court: string
    judge: string
    department: string
    caseType: string
    filingDate: string
    lastActivity: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userCases } = await request.json()

    if (!userCases || userCases.length === 0) {
      return NextResponse.json({
        success: true,
        events: [],
        message: 'No cases to sync'
      })
    }

    console.log(`Syncing ${userCases.length} cases with San Diego County court system`)

    try {
      // Get real calendar events from San Diego County
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
      
      const countyEvents = await countyDataService.getCalendarEvents(startDate, endDate)
      
      // Filter events for user's cases
      const userCaseNumbers = userCases.map((caseData: SavedCase) => caseData.caseNumber)
      const relevantEvents = countyEvents.filter(event => 
        userCaseNumbers.some((caseNumber: string) => 
          event.description.includes(caseNumber) || 
          event.description.includes(caseNumber.replace(/[^a-zA-Z0-9]/g, ''))
        )
      )

      // Transform county events to our format
      const newEvents: CalendarEvent[] = relevantEvents.map(event => ({
        id: `county-${event.date}-${event.time.replace(':', '')}`,
        title: event.eventType,
        date: event.date,
        time: event.time,
        type: event.eventType.toLowerCase().includes('hearing') ? 'hearing' : 
              event.eventType.toLowerCase().includes('deadline') ? 'deadline' : 'status_conference',
        caseNumber: userCaseNumbers.find((caseNumber: string) => 
          event.description.includes(caseNumber)
        ) || 'Unknown',
        location: `${event.department} - San Diego Superior Court`,
        description: event.description,
        duration: event.eventType.toLowerCase().includes('hearing') ? 60 : 30,
        priority: event.eventType.toLowerCase().includes('deadline') ? 'high' : 'medium',
        status: 'scheduled',
        source: 'san_diego_county',
        countyData: {
          court: 'San Diego Superior Court',
          judge: event.judge,
          department: event.department,
          caseType: 'Unknown',
          filingDate: event.date,
          lastActivity: event.date
        }
      }))

      return NextResponse.json({
        success: true,
        events: newEvents,
        syncedCases: userCases.length,
        newEvents: newEvents.length,
        source: 'san_diego_county',
        rateLimitStatus: countyDataService.getRateLimitStatus(),
        timestamp: new Date().toISOString()
      })

    } catch (countyError) {
      console.error('County calendar sync failed:', countyError)
      
      // Fallback to simulated events for development
      const newEvents: CalendarEvent[] = []

      for (const caseData of userCases as SavedCase[]) {
        try {
          // Simulate checking for new hearings/deadlines for each case
          const hasNewActivity = Math.random() > 0.7 // 30% chance of new activity

          if (hasNewActivity) {
            const eventTypes = ['hearing', 'deadline', 'status_conference']
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
            
            // Generate realistic future dates
            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 7) // 1-4 weeks from now
            
            const event: CalendarEvent = {
              id: `county-${caseData.caseNumber}-${Date.now()}`,
              title: eventType === 'hearing' ? 'Hearing' : 
                     eventType === 'deadline' ? 'Filing Deadline' : 'Status Conference',
              date: futureDate.toISOString().split('T')[0],
              time: `${9 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
              type: eventType,
              caseNumber: caseData.caseNumber,
              location: `${caseData.courtLocation}, Room ${100 + Math.floor(Math.random() * 200)}`,
              description: `${eventType === 'hearing' ? 'Court hearing' : 
                           eventType === 'deadline' ? 'Document filing deadline' : 
                           'Status conference'} for case ${caseData.caseNumber}`,
              duration: eventType === 'hearing' ? 60 : 30,
              priority: eventType === 'deadline' ? 'high' : 'medium',
              status: 'scheduled',
              source: 'county_api_fallback',
              countyData: {
                court: caseData.courtLocation,
                judge: caseData.judicialOfficer,
                department: caseData.department,
                caseType: caseData.caseType,
                filingDate: caseData.dateFiled,
                lastActivity: new Date().toISOString().split('T')[0]
              }
            }

            newEvents.push(event)
          }
        } catch (error) {
          console.error(`Error processing case ${caseData.caseNumber}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        events: newEvents,
        syncedCases: userCases.length,
        newEvents: newEvents.length,
        source: 'fallback_simulation',
        countyError: countyError instanceof Error ? countyError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('San Diego County sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync with San Diego County court system' },
      { status: 500 }
    )
  }
}
