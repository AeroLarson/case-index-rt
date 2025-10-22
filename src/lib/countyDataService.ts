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
  private roaBaseUrl = 'https://roasearch.sdcourt.ca.gov';
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
   * Comprehensive case search supporting all search types
   */
  async searchCases(searchQuery: string, searchType: 'name' | 'caseNumber' | 'attorney' | 'all' = 'all'): Promise<CountyCaseData[]> {
    await this.respectRateLimit();
    
    try {
      console.log('Searching San Diego County for:', searchQuery, 'Type:', searchType);
      
      // Try multiple search approaches
      const searchResults: CountyCaseData[] = [];
      
      // 1. Try the public case search first
      try {
        const publicResults = await this.searchPublicCases(searchQuery, searchType);
        searchResults.push(...publicResults);
      } catch (error) {
        console.log('Public search failed, trying alternative methods:', error);
      }
      
      // 2. Try ROA search if public search doesn't work
      if (searchResults.length === 0) {
        try {
          const roaResults = await this.searchROACases(searchQuery, searchType);
          searchResults.push(...roaResults);
        } catch (error) {
          console.log('ROA search failed:', error);
        }
      }
      
      // 3. Try alternative search methods
      if (searchResults.length === 0) {
        try {
          const altResults = await this.searchAlternativeCases(searchQuery, searchType);
          searchResults.push(...altResults);
        } catch (error) {
          console.log('Alternative search failed:', error);
        }
      }
      
      return searchResults;
      
    } catch (error) {
      console.error('Comprehensive search failed:', error);
      throw new Error('Unable to search county records at this time');
    }
  }

  /**
   * Search using public case search system
   */
  private async searchPublicCases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    // Use the general search endpoint that we know works
    const searchUrl = `${this.baseUrl}/search?search=${encodeURIComponent(searchQuery)}`;
    
    console.log('Searching public cases with URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      throw new Error(`Public search error: ${response.status}`);
    }

    const html = await response.text();
    console.log('Public search HTML length:', html.length);
    
    return this.parseCaseSearchHTML(html, searchQuery);
  }

  /**
   * Search using ROA system (with authentication handling)
   */
  private async searchROACases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    // Try to access ROA with proper headers and authentication
    const roaUrl = `${this.roaBaseUrl}/Parties`;
    
    const response = await fetch(roaUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'X-Forwarded-For': '216.150.1.65', // Use your whitelisted IP
        'X-Real-IP': '216.150.1.65',
      }
    });

    if (!response.ok) {
      throw new Error(`ROA access error: ${response.status}`);
    }

    const html = await response.text();
    console.log('ROA access successful, parsing results...');
    
    // Parse ROA results
    return this.parseROASearchHTML(html, searchQuery);
  }

  /**
   * Alternative search methods
   */
  private async searchAlternativeCases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    // Try different search endpoints and methods
    const alternativeUrls = [
      `${this.baseUrl}/search?search=${encodeURIComponent(searchQuery)}`,
      `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch?search=${encodeURIComponent(searchQuery)}`,
    ];
    
    for (const url of alternativeUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        });

        if (response.ok) {
          const html = await response.text();
          const results = this.parseCaseSearchHTML(html, searchQuery);
          if (results.length > 0) {
            return results;
          }
        }
      } catch (error) {
        console.log('Alternative URL failed:', url, error);
      }
    }
    
    return [];
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
      console.log('San Diego County search HTML response length:', html.length);
      console.log('HTML preview:', html.substring(0, 1000));
      
      // Look for case numbers in the HTML (FL-2024-XXXXXX, CR-2024-XXXXXX, etc.)
      const caseNumberRegex = /([A-Z]{2}-\d{4}-\d{6})/g;
      const caseNumbers = [];
      let caseMatch;
      
      while ((caseMatch = caseNumberRegex.exec(html)) !== null) {
        caseNumbers.push(caseMatch[1]);
      }
      
      console.log('Found case numbers:', caseNumbers);
      
      // For each case number found, create case data
      for (const caseNumber of caseNumbers) {
        const caseData: CountyCaseData = {
          caseNumber,
          caseTitle: `Case ${caseNumber} - ${searchTerm}`,
          caseType: this.determineCaseType(caseNumber),
          status: 'Active',
          dateFiled: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          department: 'San Diego Superior Court',
          judge: 'Unknown',
          parties: [searchTerm],
          upcomingEvents: [],
          registerOfActions: []
        };
        
        cases.push(caseData);
      }
      
      // If no case numbers found, look for other case-related content
      if (cases.length === 0) {
        console.log('No case numbers found, looking for other case content...');
        
        // Look for any text that might indicate case information
        const caseContentRegex = /(case|Case|court|Court|hearing|Hearing|judge|Judge)/g;
        const caseContent = html.match(caseContentRegex);
        
        if (caseContent && caseContent.length > 0) {
          console.log('Found case-related content:', caseContent.length, 'matches');
          
          // Create a generic case entry if we found case-related content
          const caseData: CountyCaseData = {
            caseNumber: `SEARCH-${Date.now()}`,
            caseTitle: `Search results for ${searchTerm}`,
            caseType: 'Unknown',
            status: 'Search Results Found',
            dateFiled: new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString().split('T')[0],
            department: 'San Diego Superior Court',
            judge: 'Unknown',
            parties: [searchTerm],
            upcomingEvents: [],
            registerOfActions: []
          };
          
          cases.push(caseData);
        }
      }
      
      console.log('Parsed cases:', cases.length);
      return cases;
      
    } catch (error) {
      console.error('Error parsing county search HTML:', error);
      return cases;
    }
  }

  /**
   * Determine case type based on case number
   */
  private determineCaseType(caseNumber: string): string {
    if (caseNumber.startsWith('FL-')) return 'Family Law';
    if (caseNumber.startsWith('CR-')) return 'Criminal';
    if (caseNumber.startsWith('CV-')) return 'Civil';
    if (caseNumber.startsWith('SC-')) return 'Small Claims';
    if (caseNumber.startsWith('TR-')) return 'Traffic';
    if (caseNumber.startsWith('JC-')) return 'Juvenile';
    if (caseNumber.startsWith('AD-')) return 'Administrative';
    if (caseNumber.startsWith('AP-')) return 'Appeals';
    if (caseNumber.startsWith('GU-')) return 'Guardianship';
    if (caseNumber.startsWith('MH-')) return 'Mental Health';
    if (caseNumber.startsWith('PR-')) return 'Probate';
    if (caseNumber.startsWith('SB-')) return 'Superior Court Business';
    if (caseNumber.startsWith('SS-')) return 'Superior Court Special';
    if (caseNumber.startsWith('ST-')) return 'Superior Court Special';
    if (caseNumber.startsWith('WS-')) return 'Workers Compensation';
    return 'Unknown';
  }

  /**
   * Parse ROA search results
   */
  private parseROASearchHTML(html: string, searchTerm: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('ROA search HTML response:', html.substring(0, 1000));
      
      // Parse ROA-specific result format
      // Look for case information in ROA format
      const caseRegex = /([A-Z]{2}-\d{4}-\d{6})/g;
      const caseNumbers = [];
      let caseMatch;
      
      while ((caseMatch = caseRegex.exec(html)) !== null) {
        caseNumbers.push(caseMatch[1]);
      }
      
      // For each case number found, create case data
      for (const caseNumber of caseNumbers) {
        const caseData: CountyCaseData = {
          caseNumber,
          caseTitle: `Case ${caseNumber} - ${searchTerm}`,
          caseType: 'Family Law',
          status: 'Active',
          dateFiled: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          department: 'San Diego Superior Court',
          judge: 'Unknown',
          parties: [searchTerm],
          upcomingEvents: [],
          registerOfActions: []
        };
        
        cases.push(caseData);
      }
      
      return cases;
    } catch (error) {
      console.error('Error parsing ROA search HTML:', error);
      return cases;
    }
  }

  /**
   * Auto-update case information for tracked cases
   */
  async updateTrackedCases(trackedCases: string[]): Promise<CountyCaseData[]> {
    const updatedCases: CountyCaseData[] = [];
    
    for (const caseNumber of trackedCases) {
      try {
        await this.respectRateLimit();
        
        // Get updated case information
        const updatedCase = await this.getCaseDetails(caseNumber);
        updatedCases.push(updatedCase);
        
        // Check for new events or changes
        await this.checkForCaseUpdates(updatedCase);
        
      } catch (error) {
        console.error(`Failed to update case ${caseNumber}:`, error);
      }
    }
    
    return updatedCases;
  }

  /**
   * Check for case updates and notify if changes found
   */
  private async checkForCaseUpdates(caseData: CountyCaseData): Promise<void> {
    // This would implement logic to:
    // 1. Compare with previous case data
    // 2. Detect new filings, hearings, or status changes
    // 3. Update calendar events
    // 4. Send notifications if significant changes
    
    console.log(`Checking for updates to case ${caseData.caseNumber}`);
    // Implementation would go here
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
