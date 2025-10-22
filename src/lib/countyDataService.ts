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
      // First, get the search form to extract any required tokens or form data
      const searchUrl = `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`;
      
      console.log('Searching San Diego County for:', partyName);
      
      // Try a GET request first to see the search form
      const getResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });

      if (!getResponse.ok) {
        throw new Error(`County API error: ${getResponse.status}`);
      }

      const formHtml = await getResponse.text();
      console.log('Got search form HTML:', formHtml.substring(0, 1000));
      
      // For now, return empty results since we need to implement proper form submission
      // The San Diego County system likely requires specific form tokens and CSRF protection
      console.log('Form submission not yet implemented - returning empty results');
      
      return [];
      
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
      // San Diego Superior Court case details endpoint
      const caseUrl = `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=${encodeURIComponent(caseNumber)}`;
      
      const response = await fetch(caseUrl, {
        headers: {
          'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
          'Referer': `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`,
        }
      });

      if (!response.ok) {
        throw new Error(`County API error: ${response.status}`);
      }

      const html = await response.text();
      
      // Parse the HTML response to extract detailed case information
      return this.parseCaseDetailsHTML(html, caseNumber);
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
      // San Diego Superior Court calendar endpoint
      const calendarUrl = `${this.baseUrl}/portal/portal.portal?_nfpb=true&_pageLabel=portal_portal_page_3&_nfls=false&startDate=${startDate}&endDate=${endDate}`;
      
      const response = await fetch(calendarUrl, {
        headers: {
          'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
          'Referer': `${this.baseUrl}/portal/portal.portal`,
        }
      });

      if (!response.ok) {
        throw new Error(`County API error: ${response.status}`);
      }

      const html = await response.text();
      
      // Parse the HTML response to extract calendar events
      return this.parseCalendarEventsHTML(html, startDate, endDate);
    } catch (error) {
      console.error('County calendar sync failed:', error);
      throw new Error('Unable to sync court calendar at this time');
    }
  }

  /**
   * Parse HTML response from San Diego County case search
   */
  private parseCaseSearchHTML(html: string, searchTerm: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('San Diego County search HTML response:', html.substring(0, 1000));
      
      // Look for case search results in the HTML
      // The San Diego County system returns results in a table format
      const caseTableRegex = /<table[^>]*class="[^"]*case[^"]*"[^>]*>(.*?)<\/table>/gis;
      const tableMatch = caseTableRegex.exec(html);
      
      if (tableMatch) {
        console.log('Found case results table:', tableMatch[1].substring(0, 500));
        
        // Parse table rows for case information
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
        let rowMatch;
        
        while ((rowMatch = rowRegex.exec(tableMatch[1])) !== null) {
          const rowHtml = rowMatch[1];
          
          // Extract case number, title, status, etc. from table cells
          const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
          const cells = [];
          let cellMatch;
          
          while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
            const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim();
            if (cellText) {
              cells.push(cellText);
            }
          }
          
          if (cells.length >= 3) {
            // Create case data from table cells
            const caseData: CountyCaseData = {
              caseNumber: cells[0] || 'Unknown',
              caseTitle: cells[1] || 'Unknown',
              caseType: cells[2] || 'Unknown',
              status: cells[3] || 'Unknown',
              dateFiled: cells[4] || new Date().toISOString().split('T')[0],
              lastActivity: cells[5] || new Date().toISOString().split('T')[0],
              department: 'San Diego Superior Court',
              judge: 'Unknown',
              parties: [searchTerm],
              upcomingEvents: [],
              registerOfActions: []
            };
            
            cases.push(caseData);
          }
        }
      } else {
        console.log('No case results table found in HTML');
        
        // Check if there's a "no results" message
        if (html.includes('No cases found') || html.includes('no results') || html.includes('No records found')) {
          console.log('No cases found for search term:', searchTerm);
        } else {
          console.log('Unexpected HTML structure - may need different parsing approach');
        }
      }
      
      return cases;
    } catch (error) {
      console.error('Error parsing county search HTML:', error);
      return cases;
    }
  }

  /**
   * Parse HTML response from San Diego County case details
   */
  private parseCaseDetailsHTML(html: string, caseNumber: string): CountyCaseData {
    try {
      // This is a simplified parser - in production, you'd use a proper HTML parser
      console.log('San Diego County case details HTML response:', html.substring(0, 500));
      
      // TODO: Implement proper HTML parsing for San Diego County case details
      // The actual implementation would parse the HTML structure to extract:
      // - Case information
      // - Register of actions
      // - Upcoming events
      // - Party information
      
      // For now, return a basic structure
      return {
        caseNumber,
        caseTitle: 'Case Details from San Diego County',
        caseType: 'Unknown',
        status: 'Active',
        dateFiled: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        department: 'Unknown',
        judge: 'Unknown',
        parties: [],
        upcomingEvents: [],
        registerOfActions: []
      };
    } catch (error) {
      console.error('Error parsing county case details HTML:', error);
      throw new Error('Unable to parse case details from county response');
    }
  }

  /**
   * Parse HTML response from San Diego County calendar
   */
  private parseCalendarEventsHTML(html: string, startDate: string, endDate: string): CountyEvent[] {
    try {
      // This is a simplified parser - in production, you'd use a proper HTML parser
      console.log('San Diego County calendar HTML response:', html.substring(0, 500));
      
      // TODO: Implement proper HTML parsing for San Diego County calendar
      // The actual implementation would parse the HTML structure to extract:
      // - Event dates and times
      // - Event types (hearings, deadlines, etc.)
      // - Case numbers
      // - Virtual meeting information
      
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error parsing county calendar HTML:', error);
      return [];
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
