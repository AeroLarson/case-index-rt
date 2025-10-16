import { NextRequest, NextResponse } from 'next/server'
import { AIService, CaseData } from '@/lib/aiService'

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

    // Get AI insights - no fallback, only real AI
    const insights = await AIService.generateCaseInsights(caseData)

    return NextResponse.json({
      success: true,
      insights
    })

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

