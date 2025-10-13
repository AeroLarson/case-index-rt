import { NextRequest, NextResponse } from 'next/server'
import { AIService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const {
      caseNumber,
      caseTitle,
      caseStatus,
      caseType,
      court,
      judge,
      parties,
      upcomingHearings,
      caseHistory,
      documents,
      userQuestion
    } = await request.json()

    if (!userQuestion || !caseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: userQuestion, caseNumber' },
        { status: 400 }
      )
    }

    // Prepare comprehensive case context for AI
    const caseContext = `
CASE INFORMATION:
- Case Number: ${caseNumber}
- Case Title: ${caseTitle}
- Case Type: ${caseType}
- Status: ${caseStatus}
- Court: ${court}
- Judge: ${judge}

PARTIES:
- Plaintiff/Petitioner: ${parties.plaintiff}
- Defendant/Respondent: ${parties.defendant}

UPCOMING HEARINGS:
${upcomingHearings ? upcomingHearings.map((hearing: any) => 
  `- ${hearing.type} on ${hearing.date} at ${hearing.time} at ${hearing.location}${hearing.virtualMeeting ? ` (Virtual: ${hearing.virtualMeeting})` : ''}`
).join('\n') : 'No upcoming hearings scheduled'}

CASE HISTORY:
${caseHistory ? caseHistory.map((event: any) => 
  `- ${event.date}: ${event.event} - ${event.description}`
).join('\n') : 'No case history available'}

DOCUMENTS:
${documents ? documents.map((doc: any) => `- ${doc}`).join('\n') : 'No documents listed'}

USER QUESTION: ${userQuestion}
`

    // Create AI prompt for case-specific analysis
    const prompt = `You are an AI legal assistant specializing in California family law. You have access to the complete case file above. 

IMPORTANT INSTRUCTIONS:
1. ONLY discuss this specific case (${caseNumber})
2. Provide practical, actionable legal advice
3. Reference specific dates, deadlines, and case details
4. Explain legal concepts in simple terms
5. Be professional and helpful
6. If asked about topics unrelated to this case, politely redirect to case matters
7. Focus on California family law procedures and requirements

Case Context:
${caseContext}

Please provide a helpful, specific response to the user's question about this case.`

    // Get AI response
    const aiResponse = await AIService.generateResponse(prompt)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      caseNumber,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in AI case chat:', error)
    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    )
  }
}
