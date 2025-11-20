import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const caseData: any = await request.json()

    // Validate required fields
    if (!caseData.caseNumber || !caseData.caseTitle) {
      return NextResponse.json(
        { error: 'Missing required case data fields' },
        { status: 400 }
      )
    }

    // Extract countyData if provided separately
    const countyData = caseData.countyData || caseData

    // Get AI insights using analyzeCase
    const insights = await AIService.analyzeCase(caseData, countyData)

    return NextResponse.json({
      success: true,
      insights: insights || 'AI analysis completed successfully.'
    })

  } catch (error: any) {
    console.error('AI Insights API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'AI insights failed',
        message: error.message || 'Failed to generate AI insights',
        insights: 'AI analysis is currently unavailable. Please try again later.'
      },
      { status: 500 }
    )
  }
}
