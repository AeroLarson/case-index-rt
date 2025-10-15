// AI Service for handling AI-related operations
export class AIService {
  // Generate AI response using OpenAI API or fallback
  static async generateResponse(prompt: string): Promise<string> {
    try {
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.OPENAI_API_KEY
      
      if (openaiApiKey) {
        // Use real OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are an expert legal assistant specializing in California family law. Provide practical, actionable advice based on case facts. Be professional, helpful, and focus on California legal procedures.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`)
        }

        const data = await response.json()
        return data.choices[0]?.message?.content || 'Unable to generate response.'
      } else {
        // Fallback to mock AI responses
        return this.generateMockResponse(prompt)
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      // Fallback to mock responses
      return this.generateMockResponse(prompt)
    }
  }

  // Generate mock AI responses for development/demo
  private static generateMockResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase()
    
    // Case start date questions
    if (lowerPrompt.includes('when') && (lowerPrompt.includes('start') || lowerPrompt.includes('filed') || lowerPrompt.includes('begin'))) {
      return `According to the case records, this case was filed on March 1, 2024. The initial complaint was submitted to the San Diego Superior Court, and the case has been active since then. The case number FL-2024-TEST001 indicates it's a 2024 family law case.`
    }
    
    // Case date questions
    if (lowerPrompt.includes('date') || lowerPrompt.includes('when')) {
      return `Based on the case information:
- Case filed: March 1, 2024
- Last activity: March 15, 2024 (Motion Hearing)
- Next hearing: January 27, 2026 at 9:00 AM
- Case status: Active

The case has been ongoing for about 9 months and has several key dates to track.`
    }
    
    // Case status questions
    if (lowerPrompt.includes('status') || lowerPrompt.includes('current')) {
      return `Case FL-2024-TEST001 is currently in Active status. This is a family law case (Larson v. Test Defendant) that was filed on March 1, 2024. The case is assigned to Hon. Test Judge in Department 602 at San Diego Superior Court. 

Recent activity includes a Motion Hearing on March 15, 2024, and the next scheduled hearing is a Request for Order Hearing on January 27, 2026 at 9:00 AM.`
    }
    
    // Deadline questions
    if (lowerPrompt.includes('deadline') || lowerPrompt.includes('due') || lowerPrompt.includes('response')) {
      return `Looking at the case timeline, here are the key deadlines:
- Response to Complaint: Filed on March 10, 2024
- Next hearing preparation: January 27, 2026 (Request for Order Hearing)

For the upcoming Request for Order Hearing on January 27, 2026, you typically need to file any supporting documents at least 10 court days before the hearing date. California Family Code requires responses to most motions within 30 days of service.`
    }
    
    // Hearing questions
    if (lowerPrompt.includes('hearing') || lowerPrompt.includes('court')) {
      return `The upcoming hearing details:
- Date: January 27, 2026
- Time: 9:00 AM
- Type: Request for Order Hearing
- Location: San Diego Superior Court
- Judge: Hon. Test Judge, Department 602
- Virtual attendance: Zoom ID 123-456-7890, Passcode: 123456

This is a Request for Order hearing, which typically involves temporary orders for custody, support, or other interim relief. I recommend preparing your evidence and witnesses well in advance.`
    }
    
    // Document questions
    if (lowerPrompt.includes('document') || lowerPrompt.includes('file') || lowerPrompt.includes('paperwork')) {
      return `The case includes these key documents:
- Complaint for Divorce (filed March 1, 2024)
- Summons (served March 1, 2024)
- Response to Complaint (filed March 10, 2024)
- Motion for Temporary Custody (filed March 15, 2024)
- Declaration of Service (filed March 15, 2024)

The most recent filing was the Declaration of Service on March 15, 2024, related to the Motion for Temporary Custody hearing.`
    }
    
    // Parties questions
    if (lowerPrompt.includes('party') || lowerPrompt.includes('plaintiff') || lowerPrompt.includes('defendant') || lowerPrompt.includes('who')) {
      return `The parties in this case are:
- Plaintiff/Petitioner: Aero Larson
- Defendant/Respondent: Test Defendant

This is a family law case between Aero Larson (plaintiff) and Test Defendant (defendant). The case involves family law matters, likely including divorce proceedings based on the case type.`
    }
    
    // Judge questions
    if (lowerPrompt.includes('judge') || lowerPrompt.includes('courtroom') || lowerPrompt.includes('department')) {
      return `Case FL-2024-TEST001 is assigned to:
- Judge: Hon. Test Judge
- Department: 602
- Court: San Diego Superior Court

Department 602 typically handles family law matters in San Diego County. Judge Test Judge will preside over all hearings in this case, including the upcoming Request for Order Hearing on January 27, 2026.`
    }
    
    // Strategy questions
    if (lowerPrompt.includes('strategy') || lowerPrompt.includes('next') || lowerPrompt.includes('should') || lowerPrompt.includes('recommend')) {
      return `Based on the case timeline, here's what I recommend:

1. **Immediate**: Prepare for the Request for Order Hearing on January 27, 2026
2. **Evidence**: Gather documentation for the temporary custody motion
3. **Timeline**: File any supporting declarations at least 10 court days before the hearing
4. **Communication**: Consider settlement discussions with opposing counsel
5. **Documents**: Ensure all case documents are organized and accessible

The case has been active since March 2024, so focus on moving toward resolution while protecting your client's interests.`
    }
    
    // Timeline questions
    if (lowerPrompt.includes('timeline') || lowerPrompt.includes('schedule') || lowerPrompt.includes('history')) {
      return `Here's the complete case timeline:

**March 1, 2024**: Case filed - Initial complaint and summons
**March 10, 2024**: Response to motion filed by defendant
**March 15, 2024**: Motion for Temporary Custody hearing scheduled
**January 27, 2026**: Next hearing - Request for Order Hearing at 9:00 AM

The case has been active for approximately 9 months with steady progression through the court system.`
    }
    
    // Case number questions
    if (lowerPrompt.includes('number') || lowerPrompt.includes('case number')) {
      return `The case number is FL-2024-TEST001. This breaks down as:
- FL: Family Law case type
- 2024: Year filed
- TEST001: Sequential case identifier

This is a 2024 family law case in the San Diego Superior Court system.`
    }
    
    // General case questions
    if (lowerPrompt.includes('case') || lowerPrompt.includes('overview') || lowerPrompt.includes('summary')) {
      return `Case FL-2024-TEST001 (Larson v. Test Defendant) is an active family law case filed on March 1, 2024. 

**Key Details:**
- Court: San Diego Superior Court
- Judge: Hon. Test Judge, Department 602
- Status: Active
- Next hearing: January 27, 2026 at 9:00 AM (Request for Order Hearing)
- Virtual access: Zoom ID 123-456-7890

The case involves family law matters with recent motion activity and an upcoming hearing for temporary orders.`
    }
    
    // Default response
    return `I can help you with specific information about Case FL-2024-TEST001. Based on the case records, I can provide details about:

- Case dates and timeline (filed March 1, 2024)
- Parties involved (Aero Larson v. Test Defendant)
- Upcoming hearing (January 27, 2026 at 9:00 AM)
- Court and judge information (Hon. Test Judge, Department 602)
- Case documents and filings
- Deadlines and procedural requirements

What specific aspect of the case would you like me to explain?`
  }

  // Generate case summary
  static async generateCaseSummary(caseData: any): Promise<string> {
    const prompt = `
    Generate a comprehensive case summary for the following case:
    
    Case Number: ${caseData.caseNumber || 'N/A'}
    Case Type: ${caseData.caseType || 'Family Law'}
    Status: ${caseData.status || 'Active'}
    Court: ${caseData.court || 'San Diego Superior Court'}
    Judge: ${caseData.judge || 'N/A'}
    
    Parties:
    - Plaintiff: ${caseData.parties?.plaintiff || 'N/A'}
    - Defendant: ${caseData.parties?.defendant || 'N/A'}
    
    Please provide a professional summary highlighting key case information, current status, and important considerations.
    `
    
    return this.generateResponse(prompt)
  }

  // Analyze case documents
  static async analyzeDocuments(documents: string[], caseContext: any): Promise<string> {
    const prompt = `
    Analyze the following case documents for case ${caseContext.caseNumber}:
    
    Documents: ${documents.join(', ')}
    
    Please provide insights on:
    1. Key legal issues identified
    2. Important deadlines or dates
    3. Document relationships and chronology
    4. Strategic recommendations
    
    Focus on California family law procedures and requirements.
    `
    
    return this.generateResponse(prompt)
  }

  // Generate hearing preparation advice
  static async generateHearingAdvice(hearingInfo: any, caseContext: any): Promise<string> {
    const prompt = `
    Provide hearing preparation advice for:
    
    Hearing Type: ${hearingInfo.type || 'N/A'}
    Date: ${hearingInfo.date || 'N/A'}
    Time: ${hearingInfo.time || 'N/A'}
    Location: ${hearingInfo.location || 'N/A'}
    
    Case Context: ${caseContext.caseNumber} - ${caseContext.caseType}
    
    Please provide specific recommendations for preparation, what to bring, and what to expect.
    `
    
    return this.generateResponse(prompt)
  }

  // Generate comprehensive case insights
  static async generateCaseInsights(caseData: any): Promise<any> {
    const prompt = `
    Generate comprehensive case insights for:
    
    Case Number: ${caseData.caseNumber || 'N/A'}
    Case Title: ${caseData.caseTitle || 'N/A'}
    Case Type: ${caseData.caseType || 'Family Law'}
    Status: ${caseData.status || 'Active'}
    Court: ${caseData.court || 'San Diego Superior Court'}
    Judge: ${caseData.judge || 'N/A'}
    
    Parties:
    - Petitioner: ${caseData.parties?.petitioner || 'N/A'}
    - Respondent: ${caseData.parties?.respondent || 'N/A'}
    
    Please provide:
    1. A detailed case summary
    2. Key legal points and considerations
    3. Strategic recommendations
    4. Timeline analysis
    5. Next steps and deadlines
    
    Focus on California family law procedures and practical advice.
    `
    
    const insights = await this.generateResponse(prompt)
    
    return {
      summary: insights,
      keyPoints: [
        'Case is currently active in the court system',
        'This appears to be a family law matter',
        'Regular monitoring recommended for case updates'
      ],
      recommendations: [
        'Monitor case for new filings and hearings',
        'Check court calendar for upcoming dates',
        'Review case documents for important deadlines'
      ],
      timeline: [
        {
          date: new Date().toISOString(),
          event: 'Case Review',
          description: 'Initial case analysis completed'
        }
      ]
    }
  }
}

// Export types for API usage
export interface CaseData {
  caseNumber: string
  caseTitle: string
  caseType: string
  status?: string
  court?: string
  judge?: string
  parties?: {
    petitioner: string
    respondent: string
  }
}