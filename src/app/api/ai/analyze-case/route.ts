import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    let caseData: any
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
    if (!caseData.caseNumber || !caseData.caseTitle) {
      return NextResponse.json(
        { error: 'Missing required case data fields' },
        { status: 400 }
      )
    }

    // Extract countyData if provided separately
    const countyData = caseData.countyData || caseData

    // Get AI analysis
    const analysis = await AIService.analyzeCase(caseData, countyData)

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error: any) {
    console.error('AI Analysis API Error:', error)
    
    return NextResponse.json(
      { 
        error: 'AI analysis failed',
        message: error.message || 'Failed to analyze case with AI'
      },
      { status: 500 }
    )
  }
}
