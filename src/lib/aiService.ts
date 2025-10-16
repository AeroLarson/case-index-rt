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
        // No API key available - return error
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.')
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      throw error
    }
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