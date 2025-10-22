/**
 * San Diego County Court Data Service
 * Handles real-time data mining from San Diego Superior Court
 * Compliant with rate limiting: 450 requests per 10 seconds
 */

interface CountyCaseData {
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  status: string;
  dateFiled: string;
  lastActivity: string;
  department: string;
  judge: string;
  parties: string[];
  upcomingEvents: CountyEvent[];
  registerOfActions: CountyAction[];
}

interface CountyEvent {
  date: string;
  time: string;
  eventType: string;
  department: string;
  judge: string;
  description: string;
  virtualInfo?: {
    zoomId: string;
    passcode: string;
  };
}

interface CountyAction {
  date: string;
  action: string;
  description: string;
  filedBy: string;
}

class CountyDataService {
  private baseUrl = 'https://www.sdcourt.ca.gov';
  private rateLimiter = new Map<string, number>();
  private readonly RATE_LIMIT = 450; // requests per 10 seconds
  private readonly TIME_WINDOW = 10000; // 10 seconds in milliseconds

  /**
   * Check if we can make a request without exceeding rate limits
   */
  private canMakeRequest(): boolean {
    const now = Date.now();
    const windowStart = now - this.TIME_WINDOW;
    
    // Clean old entries
    for (const [timestamp, count] of this.rateLimiter.entries()) {
      if (parseInt(timestamp) < windowStart) {
        this.rateLimiter.delete(timestamp);
      }
    }
    
    // Count requests in current window
    const currentRequests = Array.from(this.rateLimiter.values())
      .reduce((sum, count) => sum + count, 0);
    
    return currentRequests < this.RATE_LIMIT;
  }

  /**
   * Record a request for rate limiting
   */
  private recordRequest(): void {
    const now = Date.now().toString();
    const current = this.rateLimiter.get(now) || 0;
    this.rateLimiter.set(now, current + 1);
  }

  /**
   * Wait if necessary to respect rate limits
   */
  private async respectRateLimit(): Promise<void> {
    while (!this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.recordRequest();
  }

  /**
   * Search for cases by party name
   */
  async searchCases(partyName: string): Promise<CountyCaseData[]> {
    await this.respectRateLimit();
    
    try {
      // This would be the actual API call to San Diego County
      // For now, we'll implement the structure for real integration
      const response = await fetch(`${this.baseUrl}/api/cases/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        },
        body: JSON.stringify({
          partyName,
          includeRegisterOfActions: true,
          includeUpcomingEvents: true
        })
      });

      if (!response.ok) {
        throw new Error(`County API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseCountyData(data);
    } catch (error) {
      console.error('County data search failed:', error);
      throw new Error('Unable to search county records at this time');
    }
  }

  /**
   * Get detailed case information including register of actions
   */
  async getCaseDetails(caseNumber: string): Promise<CountyCaseData> {
    await this.respectRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/cases/${caseNumber}`, {
        headers: {
          'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        }
      });

      if (!response.ok) {
        throw new Error(`County API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseCountyData([data])[0];
    } catch (error) {
      console.error('County case details failed:', error);
      throw new Error('Unable to retrieve case details at this time');
    }
  }

  /**
   * Get court calendar events for a date range
   */
  async getCalendarEvents(startDate: string, endDate: string): Promise<CountyEvent[]> {
    await this.respectRateLimit();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/calendar/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        },
        body: JSON.stringify({
          startDate,
          endDate,
          includeVirtualInfo: true
        })
      });

      if (!response.ok) {
        throw new Error(`County API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseCalendarEvents(data);
    } catch (error) {
      console.error('County calendar sync failed:', error);
      throw new Error('Unable to sync court calendar at this time');
    }
  }

  /**
   * Parse raw county data into our standardized format
   */
  private parseCountyData(rawData: any[]): CountyCaseData[] {
    return rawData.map(item => ({
      caseNumber: item.caseNumber || item.case_number,
      caseTitle: item.caseTitle || item.case_title,
      caseType: item.caseType || item.case_type,
      status: item.status || item.case_status,
      dateFiled: item.dateFiled || item.date_filed,
      lastActivity: item.lastActivity || item.last_activity,
      department: item.department || item.dept,
      judge: item.judge || item.assigned_judge,
      parties: item.parties || item.case_parties || [],
      upcomingEvents: this.parseEvents(item.upcomingEvents || item.upcoming_events || []),
      registerOfActions: this.parseRegisterOfActions(item.registerOfActions || item.register_of_actions || [])
    }));
  }

  /**
   * Parse calendar events from county data
   */
  private parseCalendarEvents(rawData: any[]): CountyEvent[] {
    return rawData.map(event => ({
      date: event.date || event.event_date,
      time: event.time || event.event_time,
      eventType: event.eventType || event.event_type,
      department: event.department || event.dept,
      judge: event.judge || event.assigned_judge,
      description: event.description || event.event_description,
      virtualInfo: event.virtualInfo ? {
        zoomId: event.virtualInfo.zoomId || event.virtualInfo.zoom_id,
        passcode: event.virtualInfo.passcode
      } : undefined
    }));
  }

  /**
   * Parse register of actions from county data
   */
  private parseRegisterOfActions(rawActions: any[]): CountyAction[] {
    return rawActions.map(action => ({
      date: action.date || action.action_date,
      action: action.action || action.action_type,
      description: action.description || action.action_description,
      filedBy: action.filedBy || action.filed_by || 'Unknown'
    }));
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): { current: number; limit: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - this.TIME_WINDOW;
    
    // Clean old entries and count current requests
    let currentRequests = 0;
    for (const [timestamp, count] of this.rateLimiter.entries()) {
      if (parseInt(timestamp) < windowStart) {
        this.rateLimiter.delete(timestamp);
      } else {
        currentRequests += count;
      }
    }
    
    return {
      current: currentRequests,
      limit: this.RATE_LIMIT,
      resetTime: windowStart + this.TIME_WINDOW
    };
  }
}

export const countyDataService = new CountyDataService();
export type { CountyCaseData, CountyEvent, CountyAction };
