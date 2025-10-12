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

    // API key is hardcoded in the service

    // Get AI analysis
    const analysis = await AIService.analyzeCase(caseData)

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
