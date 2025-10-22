import { NextRequest, NextResponse } from 'next/server'
import { AIService, CaseData } from '@/lib/aiService'
import { countyDataService } from '@/lib/countyDataService'

export async function POST(request: NextRequest) {
  try {
    let caseData: CaseData
    try {
      caseData = await request.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!caseData.caseNumber || !caseData.caseTitle || !caseData.caseType) {
      return NextResponse.json(
        { error: 'Missing required case data fields' },
        { status: 400 }
      )
    }

    try {
      // Get real county data for enhanced AI insights
      const countyData = await countyDataService.getCaseDetails(caseData.caseNumber)
      
      // Generate AI insights with real county data
      const insights = await AIService.generateCaseInsights(caseData, countyData)

      return NextResponse.json({
        success: true,
        insights,
        dataSource: 'san_diego_county',
        rateLimitStatus: countyDataService.getRateLimitStatus()
      })

    } catch (countyError) {
      console.error('County data retrieval failed:', countyError)
      
      // Fallback to AI insights without county data
      const insights = await AIService.generateCaseInsights(caseData)

      return NextResponse.json({
        success: true,
        insights,
        dataSource: 'fallback',
        countyError: countyError instanceof Error ? countyError.message : 'Unknown error'
      })
    }

  } catch (error: any) {
    console.error('AI Insights API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'AI insights generation failed',
        message: error.message || 'Failed to generate case insights with AI'
      },
      { status: 500 }
    )
  }
}

