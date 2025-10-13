// Clio API Integration Service
// Real implementation for Clio CRM integration

interface ClioConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiBaseUrl: string
}

interface ClioToken {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

interface ClioContact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
}

interface ClioMatter {
  id: string
  display_name: string
  description?: string
  status: string
  practice_area: string
  client: ClioContact
  created_at: string
  updated_at: string
}

interface ClioCalendarEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  all_day: boolean
  matter?: ClioMatter
  attendees: ClioContact[]
}

class ClioAPIService {
  private config: ClioConfig
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    this.config = {
      clientId: process.env.CLIO_CLIENT_ID || '',
      clientSecret: process.env.CLIO_CLIENT_SECRET || '',
      redirectUri: process.env.CLIO_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/clio/callback`,
      apiBaseUrl: 'https://app.clio.com/api/v4'
    }
  }

  // Get OAuth authorization URL
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read write',
      state: state || 'clio_auth'
    })

    return `https://app.clio.com/oauth/authorize?${params.toString()}`
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<ClioToken> {
    const response = await fetch('https://app.clio.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code: code
      })
    })

    if (!response.ok) {
      throw new Error(`Clio token exchange failed: ${response.statusText}`)
    }

    const token: ClioToken = await response.json()
    this.accessToken = token.access_token
    this.refreshToken = token.refresh_token

    return token
  }

  // Refresh access token
  async refreshAccessToken(): Promise<ClioToken> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://app.clio.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.refreshToken
      })
    })

    if (!response.ok) {
      throw new Error(`Clio token refresh failed: ${response.statusText}`)
    }

    const token: ClioToken = await response.json()
    this.accessToken = token.access_token
    this.refreshToken = token.refresh_token

    return token
  }

  // Make authenticated API request
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const url = `${this.config.apiBaseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshAccessToken()
      
      // Retry the request
      return fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      }).then(res => res.json())
    }

    if (!response.ok) {
      throw new Error(`Clio API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Get user's matters (cases)
  async getMatters(): Promise<ClioMatter[]> {
    const response = await this.makeRequest('/matters.json')
    return response.data || []
  }

  // Get specific matter by ID
  async getMatter(matterId: string): Promise<ClioMatter> {
    const response = await this.makeRequest(`/matters/${matterId}.json`)
    return response.data
  }

  // Get calendar events
  async getCalendarEvents(startDate?: string, endDate?: string): Promise<ClioCalendarEvent[]> {
    let endpoint = '/calendar_entries.json'
    const params = new URLSearchParams()

    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    if (params.toString()) {
      endpoint += `?${params.toString()}`
    }

    const response = await this.makeRequest(endpoint)
    return response.data || []
  }

  // Create calendar event
  async createCalendarEvent(event: Partial<ClioCalendarEvent>): Promise<ClioCalendarEvent> {
    const response = await this.makeRequest('/calendar_entries.json', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'calendar_entries',
          attributes: {
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            all_day: event.all_day || false,
            matter_id: event.matter?.id
          }
        }
      })
    })

    return response.data
  }

  // Update calendar event
  async updateCalendarEvent(eventId: string, event: Partial<ClioCalendarEvent>): Promise<ClioCalendarEvent> {
    const response = await this.makeRequest(`/calendar_entries/${eventId}.json`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'calendar_entries',
          id: eventId,
          attributes: {
            title: event.title,
            description: event.description,
            start_time: event.start_time,
            end_time: event.end_time,
            all_day: event.all_day
          }
        }
      })
    })

    return response.data
  }

  // Delete calendar event
  async deleteCalendarEvent(eventId: string): Promise<void> {
    await this.makeRequest(`/calendar_entries/${eventId}.json`, {
      method: 'DELETE'
    })
  }

  // Get contacts
  async getContacts(): Promise<ClioContact[]> {
    const response = await this.makeRequest('/contacts.json')
    return response.data || []
  }

  // Create contact
  async createContact(contact: Partial<ClioContact>): Promise<ClioContact> {
    const response = await this.makeRequest('/contacts.json', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'contacts',
          attributes: {
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company
          }
        }
      })
    })

    return response.data
  }

  // Sync case data from Case Index RT to Clio
  async syncCaseToClio(caseData: any): Promise<ClioMatter> {
    // Create or update matter in Clio
    const matterData = {
      display_name: caseData.caseTitle || caseData.caseNumber,
      description: `Case synced from Case Index RT\n\nCase Number: ${caseData.caseNumber}\nCourt: ${caseData.court}\nStatus: ${caseData.status}`,
      status: 'open',
      practice_area: 'Family Law', // Default, could be determined from case type
    }

    const response = await this.makeRequest('/matters.json', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'matters',
          attributes: matterData
        }
      })
    })

    return response.data
  }

  // Sync calendar events between Case Index RT and Clio
  async syncCalendarEvents(events: any[]): Promise<void> {
    for (const event of events) {
      try {
        await this.createCalendarEvent({
          title: event.title,
          description: event.description,
          start_time: event.startTime,
          end_time: event.endTime,
          all_day: event.allDay || false
        })
      } catch (error) {
        console.error(`Failed to sync event ${event.title}:`, error)
      }
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/users/who_am_i.json')
      return true
    } catch (error) {
      console.error('Clio connection test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const clioAPI = new ClioAPIService()

// Export types for use in components
export type {
  ClioToken,
  ClioContact,
  ClioMatter,
  ClioCalendarEvent
}
