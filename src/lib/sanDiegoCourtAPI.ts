// San Diego Court Data Mining API
// This module handles real data extraction from San Diego Superior Court

interface SanDiegoCourtCase {
  caseNumber: string
  caseTitle: string
  caseType: string
  caseStatus: string
  dateFiled: string
  department: string
  courtLocation: string
  judicialOfficer: string
  parties: {
    petitioner: string
    petitionerAttorney?: string
    respondent: string
    respondentAttorney?: string
  }
  upcomingHearings: Array<{
    date: string
    time: string
    type: string
    location: string
    virtualMeeting?: string
    status: string
  }>
  registerOfActions: Array<{
    date: string
    eventType: string
    description: string
    documents: string[]
    hearingDate?: string
    hearingTime?: string
    judicialOfficer?: string
  }>
}

interface SearchParams {
  partyName?: string
  caseNumber?: string
  attorneyName?: string
  dateRange?: {
    start: string
    end: string
  }
}

class SanDiegoCourtMiner {
  private baseURL = 'https://roasearch.sdcourt.ca.gov'
  private apiKey: string
  private rateLimit: number = 100 // requests per minute
  private requestCount: number = 0
  private lastRequestTime: number = 0

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Rate limiting to respect court system
  private async rateLimitCheck(): Promise<void> {
    const now = Date.now()
    if (now - this.lastRequestTime < 60000) { // 1 minute
      if (this.requestCount >= this.rateLimit) {
        const waitTime = 60000 - (now - this.lastRequestTime)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        this.requestCount = 0
        this.lastRequestTime = Date.now()
      }
    } else {
      this.requestCount = 0
      this.lastRequestTime = now
    }
    this.requestCount++
  }

  // Search for cases by party name
  async searchByPartyName(firstName: string, lastName: string, middleName?: string): Promise<SanDiegoCourtCase[]> {
    await this.rateLimitCheck()
    
    try {
      const searchParams = new URLSearchParams({
        'PartyName.First': firstName,
        'PartyName.Middle': middleName || '',
        'PartyName.Last': lastName,
        'OtherPartyName.First': '',
        'OtherPartyName.Middle': '',
        'OtherPartyName.Last': ''
      })

      const response = await fetch(`${this.baseURL}/Parties?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Court API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseSearchResults(data)
    } catch (error) {
      console.error('Error searching by party name:', error)
      throw error
    }
  }

  // Search for cases by case number
  async searchByCaseNumber(caseNumber: string): Promise<SanDiegoCourtCase | null> {
    await this.rateLimitCheck()
    
    try {
      const response = await fetch(`${this.baseURL}/cases/${caseNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Court API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseCaseDetails(data)
    } catch (error) {
      console.error('Error searching by case number:', error)
      throw error
    }
  }

  // Search for cases by attorney name
  async searchByAttorney(attorneyName: string): Promise<SanDiegoCourtCase[]> {
    await this.rateLimitCheck()
    
    try {
      const searchParams = new URLSearchParams({
        'AttorneyName': attorneyName
      })

      const response = await fetch(`${this.baseURL}/Attorneys?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Court API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseSearchResults(data)
    } catch (error) {
      console.error('Error searching by attorney:', error)
      throw error
    }
  }

  // Get case details with full register of actions
  async getCaseDetails(caseNumber: string): Promise<SanDiegoCourtCase | null> {
    await this.rateLimitCheck()
    
    try {
      const response = await fetch(`${this.baseURL}/cases/${caseNumber}/details`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`Court API error: ${response.status}`)
      }

      const data = await response.json()
      return this.parseCaseDetails(data)
    } catch (error) {
      console.error('Error getting case details:', error)
      throw error
    }
  }

  // Parse search results from court API
  private parseSearchResults(data: any): SanDiegoCourtCase[] {
    if (!data.cases || !Array.isArray(data.cases)) {
      return []
    }

    return data.cases.map((case_: any) => ({
      caseNumber: case_.caseNumber || '',
      caseTitle: case_.caseTitle || '',
      caseType: case_.caseType || '',
      caseStatus: case_.caseStatus || '',
      dateFiled: case_.dateFiled || '',
      department: case_.department || '',
      courtLocation: case_.courtLocation || '',
      judicialOfficer: case_.judicialOfficer || '',
      parties: {
        petitioner: case_.parties?.petitioner || '',
        petitionerAttorney: case_.parties?.petitionerAttorney || '',
        respondent: case_.parties?.respondent || '',
        respondentAttorney: case_.parties?.respondentAttorney || ''
      },
      upcomingHearings: [],
      registerOfActions: []
    }))
  }

  // Parse detailed case information
  private parseCaseDetails(data: any): SanDiegoCourtCase {
    return {
      caseNumber: data.caseNumber || '',
      caseTitle: data.caseTitle || '',
      caseType: data.caseType || '',
      caseStatus: data.caseStatus || '',
      dateFiled: data.dateFiled || '',
      department: data.department || '',
      courtLocation: data.courtLocation || '',
      judicialOfficer: data.judicialOfficer || '',
      parties: {
        petitioner: data.parties?.petitioner || '',
        petitionerAttorney: data.parties?.petitionerAttorney || '',
        respondent: data.parties?.respondent || '',
        respondentAttorney: data.parties?.respondentAttorney || ''
      },
      upcomingHearings: this.parseUpcomingHearings(data.upcomingHearings || []),
      registerOfActions: this.parseRegisterOfActions(data.registerOfActions || [])
    }
  }

  // Parse upcoming hearings
  private parseUpcomingHearings(hearings: any[]): Array<{
    date: string
    time: string
    type: string
    location: string
    virtualMeeting?: string
    status: string
  }> {
    return hearings.map(hearing => ({
      date: hearing.date || '',
      time: hearing.time || '',
      type: hearing.type || '',
      location: hearing.location || '',
      virtualMeeting: hearing.virtualMeeting || '',
      status: hearing.status || 'Scheduled'
    }))
  }

  // Parse register of actions
  private parseRegisterOfActions(actions: any[]): Array<{
    date: string
    eventType: string
    description: string
    documents: string[]
    hearingDate?: string
    hearingTime?: string
    judicialOfficer?: string
  }> {
    return actions.map(action => ({
      date: action.date || '',
      eventType: action.eventType || '',
      description: action.description || '',
      documents: action.documents || [],
      hearingDate: action.hearingDate || '',
      hearingTime: action.hearingTime || '',
      judicialOfficer: action.judicialOfficer || ''
    }))
  }

  // Get virtual meeting information for hearings
  async getVirtualMeetingInfo(caseNumber: string, hearingDate: string): Promise<string | null> {
    try {
      // This would integrate with court's virtual meeting system
      const response = await fetch(`${this.baseURL}/cases/${caseNumber}/hearings/${hearingDate}/virtual`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.virtualMeetingInfo || null
    } catch (error) {
      console.error('Error getting virtual meeting info:', error)
      return null
    }
  }

  // Get court calendar for specific date range
  async getCourtCalendar(startDate: string, endDate: string, department?: string): Promise<any[]> {
    await this.rateLimitCheck()
    
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(department && { department })
      })

      const response = await fetch(`${this.baseURL}/calendar?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Court API error: ${response.status}`)
      }

      const data = await response.json()
      return data.calendar || []
    } catch (error) {
      console.error('Error getting court calendar:', error)
      throw error
    }
  }

  // Get case statistics for analytics
  async getCaseStatistics(dateRange?: { start: string; end: string }): Promise<any> {
    try {
      const params = new URLSearchParams()
      if (dateRange) {
        params.append('startDate', dateRange.start)
        params.append('endDate', dateRange.end)
      }

      const response = await fetch(`${this.baseURL}/statistics?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'CaseIndexRT/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Court API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting case statistics:', error)
      throw error
    }
  }
}

// Export the miner class
export { SanDiegoCourtMiner, type SanDiegoCourtCase, type SearchParams }
