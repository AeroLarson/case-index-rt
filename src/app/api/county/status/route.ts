import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * County Data Integration Status
 * Provides real-time status of San Diego County court data integration
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitStatus = countyDataService.getRateLimitStatus()
    
    return NextResponse.json({
      success: true,
      integration: {
        status: 'active',
        county: 'San Diego Superior Court',
        baseUrl: 'https://www.sdcourt.ca.gov',
        rateLimits: {
          current: rateLimitStatus.current,
          limit: rateLimitStatus.limit,
          resetTime: rateLimitStatus.resetTime,
          remaining: rateLimitStatus.limit - rateLimitStatus.current
        },
        features: {
          caseSearch: true,
          registerOfActions: true,
          courtCalendar: true,
          realTimeUpdates: true
        },
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('County status error:', error)
    return NextResponse.json(
      { error: 'Failed to get county integration status' },
      { status: 500 }
    )
  }
}
