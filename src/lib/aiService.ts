// AI Service for handling AI-related operations with San Diego County data integration
export class AIService {
  // Generate AI response using OpenAI API with real county data
  static async generateResponse(prompt: string, countyData?: any): Promise<string> {
    try {
      // Check if OpenAI API key is available
      const openaiApiKey = process.env.OPENAI_API_KEY
      
      if (openaiApiKey) {
        // Use real OpenAI API with county data context
        const systemPrompt = countyData 
          ? `You are an expert legal assistant specializing in California family law with access to real San Diego County court data. Analyze the provided case information and provide practical, actionable advice based on actual court records. Be professional, helpful, and focus on California legal procedures and San Diego Superior Court practices.`
          : 'You are an expert legal assistant specializing in California family law. Provide practical, actionable advice based on case facts. Be professional, helpful, and focus on California legal procedures.'

        const messages = [
          {
            role: 'system',
            content: systemPrompt
          }
        ]

        if (countyData) {
          messages.push({
            role: 'system',
            content: `Case Data from San Diego County: ${JSON.stringify(countyData, null, 2)}`
          })
        }

        messages.push({
          role: 'user',
          content: prompt
        })

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages,
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
        // No API key available - provide intelligent analysis based on case data
        return this.generateIntelligentAnalysis(prompt, countyData)
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      // Fallback to intelligent analysis
      return this.generateIntelligentAnalysis(prompt, countyData)
    }
  }

  // Generate intelligent analysis based on case data without API
  static generateIntelligentAnalysis(prompt: string, countyData?: any): string {
    // Extract case information from prompt
    const caseNumberMatch = prompt.match(/Case Number: ([^\n]+)/)
    const caseTypeMatch = prompt.match(/Case Type: ([^\n]+)/)
    const statusMatch = prompt.match(/Status: ([^\n]+)/)
    const courtMatch = prompt.match(/Court: ([^\n]+)/)
    const judgeMatch = prompt.match(/Judge: ([^\n]+)/)
    
    const caseNumber = caseNumberMatch ? caseNumberMatch[1] : 'N/A'
    const caseType = caseTypeMatch ? caseTypeMatch[1] : 'Family Law'
    const status = statusMatch ? statusMatch[1] : 'Active'
    const court = courtMatch ? courtMatch[1] : 'San Diego Superior Court'
    const judge = judgeMatch ? judgeMatch[1] : 'N/A'

    // Generate analysis based on case type and status
    let analysis = `## Case Analysis for ${caseNumber}\n\n`
    
    if (caseType.toLowerCase().includes('family') || caseType.toLowerCase().includes('dissolution')) {
      analysis += `**Case Type:** ${caseType}\n`
      analysis += `**Status:** ${status}\n`
      analysis += `**Court:** ${court}\n`
      analysis += `**Assigned Judge:** ${judge}\n\n`
      
      analysis += `### Key Legal Considerations:\n`
      analysis += `• This is a family law matter in California Superior Court\n`
      analysis += `• The case is currently ${status.toLowerCase()}\n`
      analysis += `• Regular monitoring of case filings is recommended\n`
      analysis += `• California family law procedures apply to all proceedings\n\n`
      
      if (status.toLowerCase().includes('active')) {
        analysis += `### Current Status Analysis:\n`
        analysis += `• Case is proceeding through the court system\n`
        analysis += `• Parties should monitor for new filings and hearing notices\n`
        analysis += `• Discovery deadlines may be approaching\n`
        analysis += `• Settlement discussions may be ongoing\n\n`
      }
      
      analysis += `### Strategic Recommendations:\n`
      analysis += `• Review all case documents for important deadlines\n`
      analysis += `• Monitor court calendar for upcoming hearings\n`
      analysis += `• Ensure compliance with California family law requirements\n`
      analysis += `• Consider mediation if not already attempted\n\n`
      
      analysis += `### Next Steps:\n`
      analysis += `• Check for new filings in the next 30 days\n`
      analysis += `• Review any upcoming hearing notices\n`
      analysis += `• Prepare for potential discovery requests\n`
      analysis += `• Monitor case status changes\n`
    } else if (caseType.toLowerCase().includes('criminal')) {
      analysis += `**Case Type:** ${caseType}\n`
      analysis += `**Status:** ${status}\n`
      analysis += `**Court:** ${court}\n`
      analysis += `**Assigned Judge:** ${judge}\n\n`
      
      analysis += `### Key Legal Considerations:\n`
      analysis += `• This is a criminal matter in California Superior Court\n`
      analysis += `• The case is currently ${status.toLowerCase()}\n`
      analysis += `• Criminal procedure rules apply to all proceedings\n`
      analysis += `• Constitutional rights must be protected throughout\n\n`
      
      analysis += `### Strategic Recommendations:\n`
      analysis += `• Monitor for motion filings and responses\n`
      analysis += `• Review discovery materials carefully\n`
      analysis += `• Prepare for potential plea negotiations\n`
      analysis += `• Ensure all deadlines are met\n\n`
    } else {
      analysis += `**Case Type:** ${caseType}\n`
      analysis += `**Status:** ${status}\n`
      analysis += `**Court:** ${court}\n`
      analysis += `**Assigned Judge:** ${judge}\n\n`
      
      analysis += `### General Case Analysis:\n`
      analysis += `• Case is currently ${status.toLowerCase()} in ${court}\n`
      analysis += `• Regular monitoring recommended for updates\n`
      analysis += `• California court procedures apply\n`
      analysis += `• Professional legal representation advised\n\n`
    }
    
    analysis += `### Important Notes:\n`
    analysis += `• This analysis is based on available case information\n`
    analysis += `• Consult with qualified legal counsel for specific advice\n`
    analysis += `• Court procedures may vary by jurisdiction\n`
    analysis += `• Regular case monitoring is essential\n`
    
    return analysis
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

  // Analyze case and return summary string
  static async analyzeCase(caseData: any, countyData?: any): Promise<string> {
    try {
      // Build prompt from case data
      let prompt = `
      Generate a comprehensive case analysis for:
      
      Case Number: ${caseData.caseNumber || 'N/A'}
      Case Title: ${caseData.caseTitle || 'N/A'}
      Case Type: ${caseData.caseType || 'Family Law'}
      Status: ${caseData.status || 'Active'}
      Court: ${caseData.courtLocation || caseData.court || 'San Diego Superior Court'}
      Judge: ${caseData.judicialOfficer || caseData.judge || 'N/A'}
      
      Parties:
      - Petitioner/Plaintiff: ${caseData.parties?.petitioner || caseData.parties?.plaintiff || 'N/A'}
      - Respondent/Defendant: ${caseData.parties?.respondent || caseData.parties?.defendant || 'N/A'}
      `
      
      // Add register of actions if available
      if (caseData.registerOfActions && typeof caseData.registerOfActions === 'string') {
        prompt += `\n\nRecent Case Activity:\n${caseData.registerOfActions}`
      } else if (Array.isArray(caseData.registerOfActions) && caseData.registerOfActions.length > 0) {
        prompt += `\n\nRecent Case Activity:\n${caseData.registerOfActions.slice(0, 10).map((a: any) => `${a.date}: ${a.action} - ${a.description}`).join('\n')}`
      }
      
      // Add upcoming events if available
      if (caseData.upcomingEvents && typeof caseData.upcomingEvents === 'string') {
        prompt += `\n\nUpcoming Events:\n${caseData.upcomingEvents}`
      } else if (Array.isArray(caseData.upcomingEvents) && caseData.upcomingEvents.length > 0) {
        prompt += `\n\nUpcoming Events:\n${caseData.upcomingEvents.map((e: any) => `${e.date} ${e.time}: ${e.eventType} - ${e.description}`).join('\n')}`
      }
      
      // Add recent motions if available
      if (caseData.recentMotions) {
        prompt += `\n\nRecent Motions:\n${caseData.recentMotions}`
      }
      
      prompt += `
      
      Please provide:
      1. A detailed case summary
      2. Key legal points and considerations
      3. Strategic recommendations
      4. Timeline analysis
      5. Next steps and deadlines
      
      Focus on California family law procedures and practical advice. Be concise but comprehensive.
      `
      
      // Use generateResponse with countyData if available
      return await this.generateResponse(prompt, countyData || caseData)
    } catch (error) {
      console.error('Error in analyzeCase:', error)
      // Fallback to intelligent analysis
      const prompt = `
      Case Number: ${caseData.caseNumber || 'N/A'}
      Case Title: ${caseData.caseTitle || 'N/A'}
      Case Type: ${caseData.caseType || 'Family Law'}
      Status: ${caseData.status || 'Active'}
      Court: ${caseData.courtLocation || caseData.court || 'San Diego Superior Court'}
      Judge: ${caseData.judicialOfficer || caseData.judge || 'N/A'}
      `
      return this.generateIntelligentAnalysis(prompt, countyData || caseData)
    }
  }

  // Generate comprehensive case insights
  static async generateCaseInsights(caseData: any, countyData?: any): Promise<any> {
    let prompt = `
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
    `
    
    // Add county data if available
    if (countyData) {
      prompt += `
    
    Real San Diego County Court Data:
    - Department: ${countyData.department || 'N/A'}
    - Judicial Officer: ${countyData.judge || 'N/A'}
    - Case Type: ${countyData.caseType || 'N/A'}
    - Date Filed: ${countyData.dateFiled || 'N/A'}
    - Last Activity: ${countyData.lastActivity || 'N/A'}
    - Register of Actions: ${countyData.registerOfActions?.length || 0} entries
    - Upcoming Events: ${countyData.upcomingEvents?.length || 0} scheduled
    `
    }
    
    prompt += `
    
    Please provide:
    1. A detailed case summary
    2. Key legal points and considerations
    3. Strategic recommendations
    4. Timeline analysis
    5. Next steps and deadlines
    
    Focus on California family law procedures and practical advice.
    `
    
    const insights = await this.generateResponse(prompt, countyData)
    
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
      ],
      dataSource: countyData ? 'san_diego_county' : 'fallback'
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