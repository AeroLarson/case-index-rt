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
    
    // Case status questions
    if (lowerPrompt.includes('status') || lowerPrompt.includes('current')) {
      return `Based on the case information, this case is currently in an active status. The case appears to be proceeding normally through the court system. I recommend monitoring any upcoming deadlines and ensuring all required documents are filed on time.`
    }
    
    // Deadline questions
    if (lowerPrompt.includes('deadline') || lowerPrompt.includes('due')) {
      return `Looking at the case timeline, there are several important deadlines to track. I recommend setting up calendar reminders for any upcoming filing deadlines and ensuring you have sufficient time to prepare responses. California family law typically requires responses within 30 days of service.`
    }
    
    // Hearing questions
    if (lowerPrompt.includes('hearing') || lowerPrompt.includes('court')) {
      return `The upcoming hearing is scheduled for the date shown in the case details. I recommend preparing thoroughly by reviewing all case documents, organizing evidence, and preparing any necessary witnesses. Virtual attendance is available via the provided Zoom link.`
    }
    
    // Document questions
    if (lowerPrompt.includes('document') || lowerPrompt.includes('file')) {
      return `The case includes several important documents that should be reviewed carefully. I recommend organizing them chronologically and ensuring you have copies of all filings. Consider creating a document index for easy reference during hearings.`
    }
    
    // Strategy questions
    if (lowerPrompt.includes('strategy') || lowerPrompt.includes('next') || lowerPrompt.includes('should')) {
      return `Based on the case facts, I recommend focusing on the key legal issues and ensuring all procedural requirements are met. Consider consulting with opposing counsel about potential settlement options, and prepare thoroughly for any upcoming hearings.`
    }
    
    // Timeline questions
    if (lowerPrompt.includes('timeline') || lowerPrompt.includes('schedule')) {
      return `The case timeline shows the progression of events and upcoming dates. I recommend creating a detailed calendar with all important dates and deadlines. This will help ensure nothing is missed and all filings are timely.`
    }
    
    // General case questions
    if (lowerPrompt.includes('case') || lowerPrompt.includes('overview')) {
      return `This appears to be a family law case in the San Diego Superior Court system. The case is assigned to the specified judge and is proceeding through normal court procedures. I recommend staying current with all filings and maintaining communication with all parties involved.`
    }
    
    // Default response
    return `I understand you're asking about this case. Based on the case information available, I can help you understand the legal procedures, deadlines, and next steps. Could you be more specific about what aspect of the case you'd like me to focus on? I can help with case strategy, document analysis, deadline tracking, or hearing preparation.`
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
}