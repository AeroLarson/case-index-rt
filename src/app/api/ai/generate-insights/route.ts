import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const caseData = await request.json()

    // Validate required fields
    if (!caseData.caseNumber || !caseData.caseTitle) {
      return NextResponse.json(
        { error: 'Missing required case data fields' },
        { status: 400 }
      )
    }

    // Get AI insights
    const insights = await AIService.analyzeCase(caseData)

    return NextResponse.json({
      success: true,
      insights
    })

  } catch (error: any) {
    console.error('AI Insights API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'AI insights failed',
        message: error.message || 'Failed to generate AI insights'
      },
      { status: 500 }
    )
  }
}
