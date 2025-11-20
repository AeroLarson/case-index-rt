import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'
import { userProfileManager } from '@/lib/userProfile'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get user's saved cases
    const profile = userProfileManager.getUserProfile(userId, '', '')
    const savedCases = profile.savedCases || []
    
    if (savedCases.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No saved cases to monitor',
        updates: []
      })
    }

    console.log(`🔍 Monitoring ${savedCases.length} saved cases for user ${userId}`)
    
    const updates: any[] = []
    
    // Check each saved case for updates
    for (const savedCase of savedCases.slice(0, 10)) { // Limit to 10 cases per check
      try {
        // Get current case data
        const currentData = await countyDataService.getCaseDetails(savedCase.caseNumber)
        
        // Compare with saved case data
        const changes: string[] = []
        
        // Check for status changes
        if (currentData.status !== savedCase.caseStatus) {
          changes.push(`Status changed from "${savedCase.caseStatus}" to "${currentData.status}"`)
          
          userProfileManager.addNotification(userId, {
            type: 'status_change',
            title: `Case Status Updated: ${savedCase.caseNumber}`,
            message: `Case status changed from "${savedCase.caseStatus}" to "${currentData.status}"`,
            caseNumber: savedCase.caseNumber,
            caseTitle: savedCase.caseTitle,
            actionUrl: `/search?case=${savedCase.caseNumber}`
          })
        }
        
        // Check for new register of actions
        const savedActionsCount = savedCase.notes ? parseInt(savedCase.notes) || 0 : 0
        if (currentData.registerOfActions.length > savedActionsCount) {
          const newActions = currentData.registerOfActions.slice(savedActionsCount)
          changes.push(`${newActions.length} new filing(s) added`)
          
          newActions.forEach(action => {
            userProfileManager.addNotification(userId, {
              type: 'new_filing',
              title: `New Filing: ${savedCase.caseNumber}`,
              message: `${action.action}: ${action.description}`,
              caseNumber: savedCase.caseNumber,
              caseTitle: savedCase.caseTitle,
              actionUrl: `/search?case=${savedCase.caseNumber}`,
              metadata: {
                eventType: action.action,
                date: action.date
              }
            })
          })
        }
        
        // Check for new or changed upcoming events
        if (currentData.upcomingEvents.length > 0) {
          currentData.upcomingEvents.forEach(event => {
            // Check if this is a new event or if Zoom info changed
            const existingEvent = profile.calendarEvents.find(
              e => e.caseNumber === savedCase.caseNumber && 
                   e.date === event.date && 
                   e.time === event.time
            )
            
            if (!existingEvent) {
              // New event
              changes.push(`New ${event.eventType} scheduled for ${event.date} ${event.time}`)
              
              userProfileManager.addNotification(userId, {
                type: 'hearing_scheduled',
                title: `New Hearing Scheduled: ${savedCase.caseNumber}`,
                message: `${event.eventType} scheduled for ${event.date} at ${event.time}`,
                caseNumber: savedCase.caseNumber,
                caseTitle: savedCase.caseTitle,
                actionUrl: `/search?case=${savedCase.caseNumber}`,
                metadata: {
                  eventType: event.eventType,
                  date: event.date,
                  zoomId: event.virtualInfo?.zoomId,
                  passcode: event.virtualInfo?.passcode
                }
              })
            } else if (event.virtualInfo && !existingEvent.virtualMeetingInfo) {
              // Zoom info added
              changes.push(`Zoom meeting info added for ${event.eventType} on ${event.date}`)
              
              userProfileManager.addNotification(userId, {
                type: 'zoom_updated',
                title: `Zoom Meeting Info Added: ${savedCase.caseNumber}`,
                message: `Zoom meeting ID: ${event.virtualInfo.zoomId} for ${event.eventType} on ${event.date}`,
                caseNumber: savedCase.caseNumber,
                caseTitle: savedCase.caseTitle,
                actionUrl: `/search?case=${savedCase.caseNumber}`,
                metadata: {
                  eventType: event.eventType,
                  date: event.date,
                  zoomId: event.virtualInfo.zoomId,
                  passcode: event.virtualInfo.passcode
                }
              })
            }
          })
        }
        
        // Update saved case with new action count
        if (changes.length > 0) {
          const updatedCase = { ...savedCase }
          updatedCase.notes = currentData.registerOfActions.length.toString()
          updatedCase.caseStatus = currentData.status
          
          // Update saved case
          const cases = profile.savedCases
          const caseIndex = cases.findIndex(c => c.caseNumber === savedCase.caseNumber)
          if (caseIndex >= 0) {
            cases[caseIndex] = updatedCase
            userProfileManager.saveUserProfile(profile)
          }
          
          updates.push({
            caseNumber: savedCase.caseNumber,
            changes
          })
        }
        
        // Rate limiting - wait between case checks
        await new Promise(resolve => setTimeout(resolve, 2000))
        
      } catch (error: any) {
        console.error(`Error monitoring case ${savedCase.caseNumber}:`, error.message)
        // Continue with next case
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Checked ${savedCases.length} cases, found ${updates.length} with updates`,
      updates,
      checkedAt: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Case monitoring error:', error)
    return NextResponse.json(
      { error: 'Failed to monitor cases', message: error.message },
      { status: 500 }
    )
  }
}

