import OpenAI from 'openai'

// Initialize OpenAI client with hardcoded API key for now
const getOpenAI = () => {
  const apiKey = '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'
  return new OpenAI({ apiKey })
}

export interface CaseAnalysis {
  summary: string
  keyRisks: string[]
  recommendations: string[]
  nextSteps: string[]
  confidence: number
  riskAssessment?: string
}

export interface CaseData {
  caseNumber: string
  caseTitle: string
  caseType: string
  status: string
  dateFiled: string
  parties: {
    petitioner: string
    respondent: string
    petitionerAttorney?: string
    respondentAttorney?: string
  }
  courtLocation: string
  judicialOfficer: string
  documents?: any[]
  hearings?: any[]
}

export class AIService {
  static async analyzeCase(caseData: CaseData): Promise<CaseAnalysis> {
    try {
      // Use hardcoded API key for now
      const openai = getOpenAI()

      const prompt = `
You are a legal AI assistant specializing in California family law cases. Analyze the following case data and provide a comprehensive analysis:

Case Information:
- Case Number: ${caseData.caseNumber}
- Case Title: ${caseData.caseTitle}
- Case Type: ${caseData.caseType}
- Status: ${caseData.status}
- Date Filed: ${caseData.dateFiled}
- Petitioner: ${caseData.parties.petitioner}
- Respondent: ${caseData.parties.respondent}
- Petitioner Attorney: ${caseData.parties.petitionerAttorney || 'Not specified'}
- Respondent Attorney: ${caseData.parties.respondentAttorney || 'Not specified'}
- Court Location: ${caseData.courtLocation}
- Judicial Officer: ${caseData.judicialOfficer}

Please provide a JSON response with the following structure:
{
  "summary": "A concise 1-2 sentence summary of the case status and key points",
  "keyRisks": ["Risk 1", "Risk 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "nextSteps": ["Next step 1", "Next step 2"],
  "confidence": 0.85,
  "riskAssessment": "low|medium|high"
}

Focus on:
1. Brief legal implications and potential outcomes
2. Key risks in family law cases of this type
3. Essential recommendations for the client
4. Immediate next steps in the legal process
5. California-specific legal considerations

Be professional, accurate, and concise. Keep responses brief and actionable. Confidence should be between 0.0 and 1.0.
`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal AI assistant specializing in California family law. Provide accurate, professional legal analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      const analysis = JSON.parse(response) as CaseAnalysis
      
      // Validate the response structure
      if (!analysis.summary || !analysis.keyRisks || !analysis.recommendations || !analysis.nextSteps) {
        throw new Error('Invalid AI response structure')
      }

      return analysis

    } catch (error) {
      console.error('AI Analysis Error:', error)
      
      // Fallback to mock data if AI fails
      return {
        summary: "Family law case involving custody and support matters. Consult your attorney for detailed analysis.",
        keyRisks: [
          "Case complexity requires legal guidance",
          "Timeline uncertainties in proceedings"
        ],
        recommendations: [
          "Consult with family law attorney",
          "Gather relevant documentation"
        ],
        nextSteps: [
          "Review case documents",
          "Schedule legal consultation"
        ],
        confidence: 0.5,
        riskAssessment: "medium"
      }
    }
  }

  static async generateCaseInsights(caseData: CaseData): Promise<string> {
    try {
      // Use hardcoded API key for now
      const openai = getOpenAI()

      const prompt = `
Generate 2-3 key insights for this California family law case:

Case: ${caseData.caseTitle}
Type: ${caseData.caseType}
Status: ${caseData.status}
Parties: ${caseData.parties.petitioner} vs ${caseData.parties.respondent}

Provide brief, actionable insights that would be valuable for legal professionals.
`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 300,
      })

      return completion.choices[0]?.message?.content || "AI insights temporarily unavailable."

    } catch (error) {
      console.error('AI Insights Error:', error)
      return "AI insights temporarily unavailable. Please consult with your legal team for case analysis."
    }
  }
}