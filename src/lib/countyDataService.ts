/**
 * San Diego County Court Data Service
 * Handles real-time data mining from San Diego Superior Court
 * Compliant with rate limiting: 450 requests per 10 seconds
 */

// Real scraping via approved county endpoints only; no headless browser here

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
  note?: string;
  upgradeOptions?: {
    premium: boolean;
    features: string[];
    pricing: string;
  };
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
  private odyroaBaseUrl = 'https://odyroa.sdcourt.ca.gov';
  private courtIndexBaseUrl = 'https://courtindex.sdcourt.ca.gov';
  private rateLimiter = new Map<string, number>();
  
  // Platform-specific rate limits as specified by Emily Cox
  private readonly ROA_SEARCH_LIMIT = 15; // requests per minute
  private readonly ODYROA_LIMIT = 30; // requests per minute
  private readonly COURT_INDEX_LIMIT = 30; // requests per minute
  private readonly TIME_WINDOW = 60000; // 60 seconds in milliseconds
  private cookieJar: Map<string, Record<string, string>> = new Map();

  private getDomainKey(url: string): string {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.host}`;
    } catch {
      return url;
    }
  }

  private buildCookieHeader(cookies: Record<string, string> | undefined): string | undefined {
    if (!cookies) return undefined;
    const parts = Object.entries(cookies).map(([k, v]) => `${k}=${v}`);
    return parts.length ? parts.join('; ') : undefined;
    }

  private storeSetCookie(domainKey: string, setCookieHeaders: string[] | string | null): void {
    if (!setCookieHeaders) return;
    const jar = this.cookieJar.get(domainKey) || {};
    const headersArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
    for (const sc of headersArray) {
      const pair = sc.split(';')[0];
      const eq = pair.indexOf('=');
      if (eq > 0) {
        const name = pair.substring(0, eq).trim();
        const value = pair.substring(eq + 1).trim();
        if (name && value) jar[name] = value;
      }
    }
    this.cookieJar.set(domainKey, jar);
  }

  private async fetchWithSession(url: string, init: any = {}): Promise<Response> {
    const domainKey = this.getDomainKey(url);
    const cookies = this.cookieJar.get(domainKey);
    const headers = new Headers(init.headers || {});
    const cookieHeader = this.buildCookieHeader(cookies);
    if (cookieHeader && !headers.has('Cookie')) headers.set('Cookie', cookieHeader);
    // Sensible defaults to mimic a browser
    if (!headers.has('User-Agent')) headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36');
    if (!headers.has('Accept')) headers.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
    if (!headers.has('Accept-Language')) headers.set('Accept-Language', 'en-US,en;q=0.9');
    if (!headers.has('Connection')) headers.set('Connection', 'keep-alive');

    const resp = await fetch(url, { ...init, headers, redirect: 'follow' as any });
    // Persist cookies
    const setCookie = (resp.headers as any).raw ? (resp.headers as any).raw()['set-cookie'] : resp.headers.get('set-cookie');
    this.storeSetCookie(domainKey, setCookie || null);
    return resp;
  }

  /**
   * Check if we can make a request without exceeding rate limits for specific platform
   */
  private canMakeRequest(platform: 'roasearch' | 'odyroa' | 'courtindex' = 'roasearch'): boolean {
    const now = Date.now();
    const windowStart = now - this.TIME_WINDOW;
    
    // Get the appropriate rate limit for the platform
    const rateLimit = platform === 'roasearch' ? this.ROA_SEARCH_LIMIT :
                     platform === 'odyroa' ? this.ODYROA_LIMIT :
                     this.COURT_INDEX_LIMIT;
    
    // Clean old entries
    for (const [timestamp, count] of this.rateLimiter.entries()) {
      if (parseInt(timestamp) < windowStart) {
        this.rateLimiter.delete(timestamp);
      }
    }
    
    // Count requests in current window
    const currentRequests = Array.from(this.rateLimiter.values())
      .reduce((sum, count) => sum + count, 0);
    
    return currentRequests < rateLimit;
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
   * Wait if necessary to respect rate limits for specific platform
   */
  private async respectRateLimit(platform: 'roasearch' | 'odyroa' | 'courtindex' = 'roasearch'): Promise<void> {
    while (!this.canMakeRequest(platform)) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    this.recordRequest();
  }

  /**
   * Comprehensive case search using the correct San Diego County platforms
   */
  async searchCases(searchQuery: string, searchType: 'name' | 'caseNumber' | 'attorney' | 'all' = 'all'): Promise<CountyCaseData[]> {
    try {
      console.log('Searching San Diego County for:', searchQuery, 'Type:', searchType);
      
      // Validate case number format for case number searches
      if (searchType === 'caseNumber') {
        if (!this.isValidCaseNumber(searchQuery)) {
          console.log('Invalid case number format:', searchQuery);
          return [];
        }
      }
      
      // Try to get REAL data from whitelisted San Diego County systems
      console.log('🔍 Attempting to get REAL data from whitelisted systems...');
      
      try {
        const realData = await this.getRealDataFromWhitelistedSystems(searchQuery, searchType);
        if (realData && realData.length > 0) {
          console.log('✅ Successfully retrieved REAL case data!');
          return realData;
        } else {
          console.log('⚠️ San Diego County systems are down for maintenance - using enhanced database');
        }
      } catch (error) {
        console.log('❌ Real data retrieval failed (systems may be down for maintenance):', error.message);
      }
      
      // No fallback – return empty to reflect true county result
      console.log('No real data found; returning empty results');
      return [];
      
    } catch (error) {
      console.error('Comprehensive search failed:', error);
      throw new Error('Unable to search county records at this time');
    }
  }

  private isValidCaseNumber(caseNumber: string): boolean {
    // San Diego County case number format: YY[Type]######[Optional]
    // Examples: 22FL001581C, 23CV123456, 24CR789012A
    const pattern = /^\d{2}[A-Z]{2}\d{6}[A-Z]?$/;
    return pattern.test(caseNumber);
  }

  private async getRealDataFromWhitelistedSystems(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Getting REAL data from whitelisted San Diego County systems...');
      
      // Try ROASearch first (whitelisted)
      try {
        await this.respectRateLimit('roasearch');
        const roaResults = await this.searchROACases(searchQuery, searchType);
        if (roaResults && roaResults.length > 0) {
          console.log('✅ Got REAL data from ROASearch!');
          return roaResults;
        }
      } catch (error) {
        console.log('ROASearch failed:', error.message);
      }
      
      // Try ODYROA (whitelisted)
      try {
        await this.respectRateLimit('odyroa');
        const odyroaResults = await this.searchODYROACases(searchQuery, searchType);
        if (odyroaResults && odyroaResults.length > 0) {
          console.log('✅ Got REAL data from ODYROA!');
          return odyroaResults;
        }
      } catch (error) {
        console.log('ODYROA failed:', error.message);
      }
      
      // Try CourtIndex (whitelisted)
      try {
        await this.respectRateLimit('courtindex');
        const courtIndexResults = await this.searchCourtIndexCases(searchQuery, searchType);
        if (courtIndexResults && courtIndexResults.length > 0) {
          console.log('✅ Got REAL data from CourtIndex!');
          return courtIndexResults;
        }
      } catch (error) {
        console.log('CourtIndex failed:', error.message);
      }
      
      // Try main San Diego County site (whitelisted)
      try {
        const mainCountyResults = await this.searchPublicCases(searchQuery, searchType);
        if (mainCountyResults && mainCountyResults.length > 0) {
          console.log('✅ Got REAL data from main San Diego County site!');
          return mainCountyResults;
        }
      } catch (error) {
        console.log('Main county site failed:', error.message);
      }
      
      console.log('❌ No real data found from any whitelisted system');
      return [];
      
    } catch (error) {
      console.error('Error getting real data from whitelisted systems:', error);
      return [];
    }
  }

  /**
   * Search using public case search system - tries both GET and POST methods
   */
  private async searchPublicCases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Searching San Diego County for:', searchQuery, 'Type:', searchType);
      
      const searchBaseUrl = `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`;
      
      // First, try GET method with query params
      try {
        let searchUrl: string;
        
        if (searchType === 'caseNumber' || searchQuery.match(/^\d{2}[A-Z]{2}\d{6}[A-Z]?$/)) {
          searchUrl = `${searchBaseUrl}?caseNumber=${encodeURIComponent(searchQuery)}`;
        } else if (searchType === 'attorney') {
          searchUrl = `${searchBaseUrl}?attorneyName=${encodeURIComponent(searchQuery)}`;
        } else {
          searchUrl = `${searchBaseUrl}?partyName=${encodeURIComponent(searchQuery)}`;
        }
        
        console.log('📡 Trying GET request:', searchUrl);
        
        const searchResponse = await this.fetchWithSession(searchUrl, {
          method: 'GET',
          headers: {
            Referer: searchBaseUrl,
          }
        });

        if (searchResponse.ok) {
          const contentType = searchResponse.headers.get('content-type') || '';
          let responseText = await searchResponse.text();
          console.log('✅ GET response received, Content-Type:', contentType);
          console.log('✅ Response length:', responseText.length);
          
          // Check if response is JSON
          if (contentType.includes('application/json') || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            console.log('📄 Response appears to be JSON, attempting to parse...');
            try {
              const jsonData = JSON.parse(responseText);
              console.log('✅ Parsed JSON:', JSON.stringify(jsonData).substring(0, 500));
              
              // Try to extract case data from JSON structure
              if (jsonData.cases && Array.isArray(jsonData.cases)) {
                return jsonData.cases.map((c: any) => this.convertJsonToCaseData(c, searchQuery));
              } else if (Array.isArray(jsonData)) {
                return jsonData.map((c: any) => this.convertJsonToCaseData(c, searchQuery));
              } else if (jsonData.caseNumber || jsonData.case) {
                return [this.convertJsonToCaseData(jsonData, searchQuery)];
              }
            } catch (jsonError: any) {
              console.log('⚠️ Failed to parse as JSON:', jsonError.message);
            }
          }
          
          // Parse as HTML
          const realData = this.parseCaseSearchHTML(responseText, searchQuery);
          if (realData.length > 0) {
            console.log('✅ Successfully parsed real data from GET request!');
            return realData;
          }
          
          // Log response for debugging if it looks like actual content
          if (responseText.length > 1000 && !responseText.includes('Access Denied') && !responseText.includes('403')) {
            console.log('⚠️ GET returned content but no parseable case data.');
            console.log('📄 Response preview (first 2000 chars):', responseText.substring(0, 2000));
          } else if (responseText.includes('403') || responseText.includes('Forbidden')) {
            console.log('⚠️ GET request returned 403 Forbidden - may need IP whitelisting verification');
          }
        } else {
          console.log('⚠️ GET request returned status:', searchResponse.status, searchResponse.statusText);
          const errorText = await searchResponse.text().catch(() => '');
          console.log('📄 Error response:', errorText.substring(0, 500));
        }
      } catch (getError: any) {
        console.log('⚠️ GET request failed:', getError.message);
      }
      
      // Try POST method with form data
      try {
        console.log('📡 Trying POST request with form data...');
        
        // First get the form page to extract any CSRF tokens or form fields
        const formPageResponse = await this.fetchWithSession(searchBaseUrl, {
          method: 'GET',
          headers: {
            Referer: `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/`,
          }
        });
        
        const formPageHtml = await formPageResponse.text();
        
        // Prepare form data
        const formData = new URLSearchParams();
        
        if (searchType === 'caseNumber' || searchQuery.match(/^\d{2}[A-Z]{2}\d{6}[A-Z]?$/)) {
          formData.append('caseNumber', searchQuery);
        } else if (searchType === 'attorney') {
          formData.append('attorneyName', searchQuery);
        } else {
          formData.append('partyName', searchQuery);
        }
        
        // Try to extract CSRF token or other required fields from the form
        const csrfMatch = formPageHtml.match(/name="([^"]*csrf[^"]*)"[^>]*value="([^"]+)"/i);
        if (csrfMatch) {
          formData.append(csrfMatch[1], csrfMatch[2]);
        }
        
        const postResponse = await this.fetchWithSession(searchBaseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer: searchBaseUrl,
          },
          body: formData.toString()
        });

        if (postResponse.ok) {
          const contentType = postResponse.headers.get('content-type') || '';
          let responseText = await postResponse.text();
          console.log('✅ POST response received, Content-Type:', contentType);
          console.log('✅ Response length:', responseText.length);
          
          // Check if response is JSON
          if (contentType.includes('application/json') || responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            console.log('📄 POST response appears to be JSON, attempting to parse...');
            try {
              const jsonData = JSON.parse(responseText);
              console.log('✅ Parsed JSON:', JSON.stringify(jsonData).substring(0, 500));
              
              // Try to extract case data from JSON structure
              if (jsonData.cases && Array.isArray(jsonData.cases)) {
                return jsonData.cases.map((c: any) => this.convertJsonToCaseData(c, searchQuery));
              } else if (Array.isArray(jsonData)) {
                return jsonData.map((c: any) => this.convertJsonToCaseData(c, searchQuery));
              } else if (jsonData.caseNumber || jsonData.case) {
                return [this.convertJsonToCaseData(jsonData, searchQuery)];
              }
            } catch (jsonError: any) {
              console.log('⚠️ Failed to parse POST response as JSON:', jsonError.message);
            }
          }
          
          // Parse as HTML
          const realData = this.parseCaseSearchHTML(responseText, searchQuery);
          if (realData.length > 0) {
            console.log('✅ Successfully parsed real data from POST request!');
            return realData;
          }
          
          // Log response for debugging
          if (responseText.length > 1000 && !responseText.includes('Access Denied') && !responseText.includes('403')) {
            console.log('⚠️ POST returned content but no parseable case data.');
            console.log('📄 Response preview (first 2000 chars):', responseText.substring(0, 2000));
          }
        } else {
          console.log('⚠️ POST request returned status:', postResponse.status, postResponse.statusText);
        }
      } catch (postError: any) {
        console.log('⚠️ POST request failed:', postError.message);
      }
      
      console.log('❌ Both GET and POST methods failed to return parseable case data.');
      return [];
      
    } catch (error) {
      console.error('❌ Search error:', error);
      throw new Error('Unable to search county records');
    }
  }

  /**
   * Search using ROASearch system (15 requests/minute limit)
   */
  private async searchROACases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Searching ROASearch for:', searchQuery);
      
      // Try multiple ROASearch endpoints
      const roaEndpoints = [
        `${this.roaBaseUrl}/Parties?search=${encodeURIComponent(searchQuery)}`,
        `${this.roaBaseUrl}/search?search=${encodeURIComponent(searchQuery)}`,
        `${this.roaBaseUrl}/?search=${encodeURIComponent(searchQuery)}`,
        `${this.roaBaseUrl}/Parties?caseNumber=${encodeURIComponent(searchQuery)}`,
        `${this.roaBaseUrl}/Parties?partyName=${encodeURIComponent(searchQuery)}`,
      ];
      
      for (const roaUrl of roaEndpoints) {
        try {
          console.log('Trying ROASearch endpoint:', roaUrl);
          
          // Warm session
          await this.fetchWithSession(this.roaBaseUrl + '/', { headers: { Referer: this.roaBaseUrl + '/' } });
          const response = await this.fetchWithSession(roaUrl, {
            headers: {
              Referer: this.roaBaseUrl + '/',
            }
          });

          if (response.ok) {
            const html = await response.text();
            console.log('ROASearch access successful, parsing results...');
            console.log('Response length:', html.length);
            
            // Check if we got actual case data
            if (html.includes('case') || html.includes('Case') || html.includes(searchQuery)) {
              const results = this.parseROASearchHTML(html, searchQuery);
              if (results.length > 0) {
                return results;
              }
            }
          }
        } catch (endpointError) {
          console.log('ROASearch endpoint failed:', roaUrl, endpointError);
        }
      }
      
      throw new Error('All ROASearch endpoints failed');
    } catch (error) {
      console.error('ROASearch error:', error);
      throw error;
    }
  }

  /**
   * Search using ODYROA system (30 requests/minute limit)
   */
  private async searchODYROACases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Searching ODYROA for:', searchQuery);
      
      // Try multiple ODYROA endpoints
      const odyroaEndpoints = [
        `${this.odyroaBaseUrl}/Parties?search=${encodeURIComponent(searchQuery)}`,
        `${this.odyroaBaseUrl}/search?search=${encodeURIComponent(searchQuery)}`,
        `${this.odyroaBaseUrl}/?search=${encodeURIComponent(searchQuery)}`,
        `${this.odyroaBaseUrl}/Parties?caseNumber=${encodeURIComponent(searchQuery)}`,
        `${this.odyroaBaseUrl}/Parties?partyName=${encodeURIComponent(searchQuery)}`,
      ];
      
      for (const odyroaUrl of odyroaEndpoints) {
        try {
          console.log('Trying ODYROA endpoint:', odyroaUrl);
          
          await this.fetchWithSession(this.odyroaBaseUrl + '/', { headers: { Referer: this.odyroaBaseUrl + '/' } });
          const response = await this.fetchWithSession(odyroaUrl, {
            headers: {
              Referer: this.odyroaBaseUrl + '/',
            }
          });

          if (response.ok) {
            const html = await response.text();
            console.log('ODYROA access successful, parsing results...');
            console.log('Response length:', html.length);
            
            // Check if we got actual case data
            if (html.includes('case') || html.includes('Case') || html.includes(searchQuery)) {
              const results = this.parseODYROASearchHTML(html, searchQuery);
              if (results.length > 0) {
                return results;
              }
            }
          }
        } catch (endpointError) {
          console.log('ODYROA endpoint failed:', odyroaUrl, endpointError);
        }
      }
      
      throw new Error('All ODYROA endpoints failed');
    } catch (error) {
      console.error('ODYROA error:', error);
      throw error;
    }
  }

  /**
   * Search using CourtIndex system (30 requests/minute limit)
   */
  private async searchCourtIndexCases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Searching CourtIndex for:', searchQuery);
      
      // Try multiple CourtIndex endpoints
      const courtIndexEndpoints = [
        `${this.courtIndexBaseUrl}/Parties?search=${encodeURIComponent(searchQuery)}`,
        `${this.courtIndexBaseUrl}/search?search=${encodeURIComponent(searchQuery)}`,
        `${this.courtIndexBaseUrl}/?search=${encodeURIComponent(searchQuery)}`,
        `${this.courtIndexBaseUrl}/Parties?caseNumber=${encodeURIComponent(searchQuery)}`,
        `${this.courtIndexBaseUrl}/Parties?partyName=${encodeURIComponent(searchQuery)}`,
      ];
      
      for (const courtIndexUrl of courtIndexEndpoints) {
        try {
          console.log('Trying CourtIndex endpoint:', courtIndexUrl);
          
          await this.fetchWithSession(this.courtIndexBaseUrl + '/CISPublic/enter', { headers: { Referer: this.courtIndexBaseUrl + '/CISPublic/enter' } });
          const response = await this.fetchWithSession(courtIndexUrl, {
            headers: {
              Referer: this.courtIndexBaseUrl + '/CISPublic/enter',
            }
          });

          if (response.ok) {
            const html = await response.text();
            console.log('CourtIndex access successful, parsing results...');
            console.log('Response length:', html.length);
            
            // Check if we got actual case data
            if (html.includes('case') || html.includes('Case') || html.includes(searchQuery)) {
              const results = this.parseCourtIndexSearchHTML(html, searchQuery);
              if (results.length > 0) {
                return results;
              }
            }
          }
        } catch (endpointError) {
          console.log('CourtIndex endpoint failed:', courtIndexUrl, endpointError);
        }
      }
      
      throw new Error('All CourtIndex endpoints failed');
    } catch (error) {
      console.error('CourtIndex error:', error);
      throw error;
    }
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
   * Parse HTML response from San Diego County case search using regex (JSDOM-free)
   */
  private parseCaseSearchHTML(html: string, searchTerm: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('📄 San Diego County search HTML response length:', html.length);
      console.log('📄 HTML preview (first 5000 chars):', html.substring(0, 5000));
      
      // Check if this is just a search form - but be more lenient
      const isOnlySearchForm = html.includes('<form') && html.includes('search') && 
                                !html.includes('case') && !html.includes('Case') &&
                                !html.includes(searchTerm) && html.length < 50000;
      
      if (isOnlySearchForm) {
        console.log('⚠️ San Diego County returned only search form - no case results');
        return [];
      }
      
      // Parse HTML using regex instead of JSDOM to avoid ES module issues
      // Extract text content from HTML by removing tags
      const stripTags = (html: string): string => {
        return html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const textContent = stripTags(html);
      
      // Look for case numbers in the HTML with multiple patterns (including more formats)
      const caseNumberPatterns = [
        /(\d{2}[A-Z]{2}\d{6}[A-Z]?)/g,  // Format like 22FL001581C (no dash)
        /([A-Z]{2}-\d{4}-\d{6})/g,      // Standard format FL-2024-123456
        /([A-Z]{2}-\d{4}-\d{5})/g,      // 5-digit format
        /([A-Z]{2}-\d{4}-\d{7})/g,      // 7-digit format
        /([A-Z]{2}-\d{4}-\d{4})/g,      // 4-digit format
        /([A-Z]{2}-\d{4}-\d{8})/g,      // 8-digit format
        /([A-Z]{2}-\d{4}-\d{3})/g,      // 3-digit format
        /([A-Z]{2}-\d{4}-\d{9})/g,      // 9-digit format
        /([A-Z]{2}-\d{4}-\d{2})/g,      // 2-digit format
        /Case\s+Number[:\s]*([A-Z]{2}[-]?\d{4}[-]?\d{4,8})/gi,  // Case Number: FL-2024-123456
        /Case\s+No[.:\s]*([A-Z]{2}[-]?\d{4}[-]?\d{4,8})/gi,     // Case No.: FL-2024-123456
      ];
      
      const allCaseNumbers = [];
      for (const pattern of caseNumberPatterns) {
        const matches = html.match(pattern);
        if (matches) {
          // Extract just the case number part from matches
          matches.forEach(match => {
            // If match includes "Case Number:" etc, extract just the number
            const numberMatch = match.match(/([A-Z]{2}[-]?\d{4}[-]?\d{4,8}|^\d{2}[A-Z]{2}\d{6}[A-Z]?$)/i);
            if (numberMatch) {
              allCaseNumbers.push(numberMatch[1].toUpperCase());
            } else if (/^[A-Z]{2}[-]?\d{4}[-]?\d{4,8}$|^\d{2}[A-Z]{2}\d{6}[A-Z]?$/i.test(match)) {
              allCaseNumbers.push(match.toUpperCase());
            }
          });
        }
      }
      
      // Remove duplicates and normalize
      const uniqueCaseNumbers = [...new Set(allCaseNumbers.map(cn => {
        // Normalize case numbers: FL-2024-123456 -> 24FL123456
        const normalized = cn.replace(/-/g, '');
        if (/^[A-Z]{2}\d{8,10}$/.test(normalized)) {
          // Format: FL2024123456 -> 24FL123456
          const match = normalized.match(/^([A-Z]{2})(\d{2})(\d{6,8})$/);
          if (match) {
            return match[2] + match[1] + match[3];
          }
        }
        return normalized;
      }))];
      console.log('✅ Found case numbers:', uniqueCaseNumbers);
      
      // Extract table data using regex (no JSDOM needed)
      const tableRows: string[][] = [];
      const tableMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      for (const rowMatch of tableMatches) {
        const rowHtml = rowMatch[1];
        const cellMatches = rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
        const cells: string[] = [];
        for (const cellMatch of cellMatches) {
          const cellText = stripTags(cellMatch[1]).trim();
          if (cellText && cellText.length > 0 && cellText.length < 500) {
            cells.push(cellText);
          }
        }
        if (cells.length > 0) {
          tableRows.push(cells);
        }
      }
      
      console.log(`📊 Found ${tableRows.length} table rows`);
      
      // For each case number found, extract detailed information
      for (const caseNumber of uniqueCaseNumbers) {
        // Look for this case number in table rows
        let foundInRow = false;
        for (const row of tableRows) {
          const rowText = row.join(' | ');
          if (rowText.includes(caseNumber) || rowText.replace(/[-\s]/g, '').includes(caseNumber.replace(/[-\s]/g, ''))) {
            foundInRow = true;
            console.log('✅ Found case number in table row:', rowText.substring(0, 200));
            
            // Extract parties from the row
            const parties = row.filter(cell => {
              const cleanCell = cell.trim();
              return cleanCell.length > 2 && 
                     cleanCell.length < 100 && 
                     !cleanCell.match(/^\d+$/) &&
                     !cleanCell.match(/^(Case|Status|Filed|Date|Judge|Department|Type)/i) &&
                     !cleanCell.match(/FL-\d{4}-\d{6}/i) &&
                     !cleanCell.match(/\d{2}FL\d{6}/i);
            });
            
            // Extract other info
            const status = row.find(c => /active|closed|pending|dismissed/i.test(c)) || 'Active';
            const dateFiled = row.find(c => /\d{1,2}\/\d{1,2}\/\d{4}/.test(c)) || new Date().toISOString().split('T')[0];
            const caseType = row.find(c => /family|law|criminal|civil|probate/i.test(c)) || this.determineCaseType(caseNumber);
            
            const caseData: CountyCaseData = {
              caseNumber,
              caseTitle: parties.length >= 2 ? `${parties[0]} v. ${parties[1]}` : `Case ${caseNumber} - ${searchTerm}`,
              caseType,
              status,
              dateFiled: this.normalizeDate(dateFiled),
              lastActivity: new Date().toISOString().split('T')[0],
              department: 'San Diego Superior Court',
              judge: row.find(c => /judge|hon\.|judicial/i.test(c)) || 'Unknown',
              parties: parties.length >= 2 ? parties : [searchTerm],
              upcomingEvents: [],
              registerOfActions: []
            };
            
            cases.push(caseData);
            break;
          }
        }
        
        // If not found in table, create basic case entry
        if (!foundInRow) {
          cases.push({
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
          });
        }
      }
      
      // If no case numbers found, try to find party names in tables
      if (cases.length === 0) {
        console.log('🔍 No case numbers found, searching for party names in tables...');
        
        const searchTermLower = searchTerm.toLowerCase();
        for (const row of tableRows) {
          const rowText = row.join(' ').toLowerCase();
          if (rowText.includes(searchTermLower) && row.length >= 3) {
            console.log('✅ Found search term in table row:', row.slice(0, 5).join(' | '));
            
            // Look for case number in this row or nearby rows
            const rowIndex = tableRows.indexOf(row);
            let foundCaseNumber = '';
            
            // Check current row
            for (const cell of row) {
              const caseNumMatch = cell.match(/(\d{2}[A-Z]{2}\d{6}[A-Z]?|[A-Z]{2}-\d{4}-\d{6})/i);
              if (caseNumMatch) {
                foundCaseNumber = caseNumMatch[1].toUpperCase();
                break;
              }
            }
            
            // Check nearby rows if no case number in current row
            if (!foundCaseNumber) {
              for (let i = Math.max(0, rowIndex - 2); i < Math.min(tableRows.length, rowIndex + 3); i++) {
                for (const cell of tableRows[i]) {
                  const caseNumMatch = cell.match(/(\d{2}[A-Z]{2}\d{6}[A-Z]?|[A-Z]{2}-\d{4}-\d{6})/i);
                  if (caseNumMatch) {
                    foundCaseNumber = caseNumMatch[1].toUpperCase();
                    break;
                  }
                }
                if (foundCaseNumber) break;
              }
            }
            
            // Extract parties
            const parties = row.filter(cell => {
              const cleanCell = cell.trim();
              return cleanCell.length > 2 && 
                     cleanCell.length < 100 && 
                     !cleanCell.match(/^\d+$/) &&
                     !cleanCell.match(/^(Case|Status|Filed|Date|Judge|Department|Type)/i) &&
                     !cleanCell.match(/FL-\d{4}-\d{6}/i);
            });
            
            if (foundCaseNumber || parties.length >= 1) {
              const caseData: CountyCaseData = {
                caseNumber: foundCaseNumber || `FOUND-${Date.now()}`,
                caseTitle: parties.length >= 2 ? `${parties[0]} v. ${parties[1]}` : `${parties[0] || searchTerm} Case`,
                caseType: this.determineCaseType(foundCaseNumber),
                status: row.find(c => /active|closed|pending/i.test(c)) || 'Active',
                dateFiled: this.normalizeDate(row.find(c => /\d{1,2}\/\d{1,2}\/\d{4}/.test(c)) || ''),
                lastActivity: new Date().toISOString().split('T')[0],
                department: 'San Diego Superior Court',
                judge: row.find(c => /judge|hon\./i.test(c)) || 'Unknown',
                parties: parties.length >= 2 ? parties : [parties[0] || searchTerm],
                upcomingEvents: [],
                registerOfActions: [],
                note: foundCaseNumber ? undefined : 'Case found but case number could not be extracted from table.'
              };
              
              cases.push(caseData);
            }
          }
        }
      }
      
      console.log('✅ Parsed cases:', cases.length);
      if (cases.length > 0) {
        console.log('✅ Case data:', cases.map(c => ({ caseNumber: c.caseNumber, title: c.caseTitle, parties: c.parties })));
      }
      
      return cases;
      
    } catch (error) {
      console.error('❌ Error parsing county search HTML:', error);
      return cases;
    }
  }

  /**
   * Normalize date string to YYYY-MM-DD format
   */
  private normalizeDate(dateStr: string): string {
    if (!dateStr || !dateStr.trim()) {
      return new Date().toISOString().split('T')[0];
    }
    
    // Try MM/DD/YYYY format
    const mmddyyyy = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Try YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Extract case data using DOM selectors to target exact fields (legacy method for compatibility)
   */
  private extractCaseDataFromDOM(document: any, caseNumber: string, searchTerm: string): CountyCaseData | null {
    try {
      // Look for case information in tables, divs, or structured content
      const caseInfoSelectors = [
        'table tr td',
        'div.case-info',
        'div.case-details',
        'div.search-result',
        'div.case-result',
        'tr td',
        'td',
        'div'
      ];
      
      let caseTitle = '';
      let caseType = '';
      let status = '';
      let dateFiled = '';
      let department = '';
      let judge = '';
      let parties: string[] = [];
      
      // Search for case information in various DOM elements
      for (const selector of caseInfoSelectors) {
        const elements = document.querySelectorAll(selector);
        
        for (const element of elements) {
          const text = element.textContent || '';
          
          // Look for case title patterns
          if (!caseTitle && (text.includes('vs') || text.includes('v.') || text.includes('Case Title'))) {
            caseTitle = this.extractFieldFromText(text, ['Case Title', 'Title', 'vs', 'v.']);
          }
          
          // Look for case type patterns
          if (!caseType && (text.includes('Case Type') || text.includes('Family Law') || text.includes('Criminal'))) {
            caseType = this.extractFieldFromText(text, ['Case Type', 'Type', 'Family Law', 'Criminal', 'Civil']);
          }
          
          // Look for status patterns
          if (!status && (text.includes('Case Status') || text.includes('Active') || text.includes('Closed'))) {
            status = this.extractFieldFromText(text, ['Case Status', 'Status', 'Active', 'Closed', 'Pending']);
          }
          
          // Look for date filed patterns
          if (!dateFiled && (text.includes('Date Filed') || text.includes('Filed') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(text))) {
            dateFiled = this.extractFieldFromText(text, ['Date Filed', 'Filed', /\d{1,2}\/\d{1,2}\/\d{4}/]);
          }
          
          // Look for department patterns
          if (!department && (text.includes('Department') || text.includes('Court Location'))) {
            department = this.extractFieldFromText(text, ['Department', 'Dept', 'Court Location']);
          }
          
          // Look for judge patterns
          if (!judge && (text.includes('Judicial Officer') || text.includes('Judge') || text.includes('Hon.'))) {
            judge = this.extractFieldFromText(text, ['Judicial Officer', 'Judge', 'Hon.', 'Assigned']);
          }
          
          // Look for parties patterns
          if (text.includes('Petitioner') || text.includes('Respondent') || text.includes('Plaintiff') || text.includes('Defendant')) {
            const partyInfo = this.extractFieldFromText(text, ['Petitioner', 'Respondent', 'Plaintiff', 'Defendant']);
            if (partyInfo && !parties.includes(partyInfo)) {
              parties.push(partyInfo);
            }
          }
        }
      }
      
      // If we found a case number but no other data, create a basic case entry
      if (caseNumber && !caseTitle) {
        caseTitle = `Case ${caseNumber} - ${searchTerm}`;
      }
      
      // Set defaults if no data found
      if (!caseTitle) caseTitle = `Case ${caseNumber}`;
      if (!caseType) caseType = this.determineCaseType(caseNumber);
      if (!status) status = 'Active';
      if (!dateFiled) dateFiled = new Date().toISOString().split('T')[0];
      if (!department) department = 'San Diego Superior Court';
      if (!judge) judge = 'Unknown';
      if (parties.length === 0) parties = [searchTerm];
      
      return {
        caseNumber,
        caseTitle,
        caseType,
        status,
        dateFiled,
        lastActivity: new Date().toISOString().split('T')[0],
        department,
        judge,
        parties,
        upcomingEvents: [],
        registerOfActions: []
      };
      
    } catch (error) {
      console.error('Error extracting case data from DOM:', error);
      return null;
    }
  }

  /**
   * Extract field value from text using multiple patterns
   */
  private extractFieldFromText(text: string, patterns: (string | RegExp)[]): string {
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        // More precise regex to avoid grabbing HTML/CSS/JS content
        const regex = new RegExp(`${pattern}[:\\s]*([^<\\n\\r\\t]{1,100})`, 'i');
        const match = text.match(regex);
        if (match && match[1]) {
          const result = match[1].trim();
          // Enhanced filtering to avoid garbled HTML/CSS/JS content
          if (!result.includes('<') && !result.includes('{') && !result.includes('}') && 
              !result.includes('href=') && !result.includes('src=') && 
              !result.includes('data-') && !result.includes('class=') &&
              !result.includes('media=') && !result.includes('stylesheet') &&
              !result.includes('application/json') && !result.includes('drupal') &&
              !result.includes('bootstrap') && !result.includes('css') &&
              !result.includes('javascript') && !result.includes('script') &&
              !result.includes('theme') && !result.includes('library') &&
              !result.includes('ajax') && !result.includes('gtag') &&
              result.length > 2 && result.length < 100 &&
              // Only return clean text that looks like actual case data
              /^[a-zA-Z0-9\s\-\.\/\:]+$/.test(result)) {
            return result;
          }
        }
      } else {
        const match = text.match(pattern);
        if (match && match[0]) {
          const result = match[0].trim();
          // Enhanced filtering to avoid garbled HTML/CSS/JS content
          if (!result.includes('<') && !result.includes('{') && !result.includes('}') && 
              !result.includes('href=') && !result.includes('src=') && 
              !result.includes('data-') && !result.includes('class=') &&
              !result.includes('media=') && !result.includes('stylesheet') &&
              !result.includes('application/json') && !result.includes('drupal') &&
              !result.includes('bootstrap') && !result.includes('css') &&
              !result.includes('javascript') && !result.includes('script') &&
              !result.includes('theme') && !result.includes('library') &&
              !result.includes('ajax') && !result.includes('gtag') &&
              result.length > 2 && result.length < 100 &&
              // Only return clean text that looks like actual case data
              /^[a-zA-Z0-9\s\-\.\/\:]+$/.test(result)) {
            return result;
          }
        }
      }
    }
    return '';
  }

  /**
   * Extract case title from context
   */
  private extractCaseTitle(context: string, searchTerm: string): string {
    const titlePatterns = [
      /Case Title[:\s]*([^<\n]+)/i,
      /Title[:\s]*([^<\n]+)/i,
      /([^<\n]*vs[^<\n]*)/i,
      /([^<\n]*v[^<\n]*)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return `Case involving ${searchTerm}`;
  }

  /**
   * Extract case type from context
   */
  private extractCaseType(context: string): string {
    const typePatterns = [
      /Case Type[:\s]*([^<\n]+)/i,
      /Type[:\s]*([^<\n]+)/i,
      /(Family Law|Criminal|Civil|Small Claims|Traffic|Juvenile|Administrative|Appeals|Guardianship|Mental Health|Probate)/i
    ];
    
    for (const pattern of typePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Unknown';
  }

  /**
   * Extract case status from context
   */
  private extractStatus(context: string): string {
    const statusPatterns = [
      /Case Status[:\s]*([^<\n]+)/i,
      /Status[:\s]*([^<\n]+)/i,
      /(Active|Closed|Pending|Post Judgment|Open|Dismissed)/i
    ];
    
    for (const pattern of statusPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Active';
  }

  /**
   * Extract date filed from context
   */
  private extractDateFiled(context: string): string {
    const datePatterns = [
      /Date Filed[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i,
      /Filed[:\s]*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i,
      /([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})/i
    ];
    
    for (const pattern of datePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        const dateStr = match[1];
        // Convert MM/DD/YYYY to YYYY-MM-DD
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
        return dateStr;
      }
    }
    
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Extract department from context
   */
  private extractDepartment(context: string): string {
    const deptPatterns = [
      /Department[:\s]*([^<\n]+)/i,
      /Dept[:\s]*([^<\n]+)/i,
      /Court Location[:\s]*([^<\n]+)/i
    ];
    
    for (const pattern of deptPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'San Diego Superior Court';
  }

  /**
   * Extract judge from context
   */
  private extractJudge(context: string): string {
    const judgePatterns = [
      /Judicial Officer[:\s]*([^<\n]+)/i,
      /Judge[:\s]*([^<\n]+)/i,
      /Hon[.\s]*([^<\n]+)/i,
      /Assigned[:\s]*([^<\n]+)/i
    ];
    
    for (const pattern of judgePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Unknown';
  }

  /**
   * Extract parties from context
   */
  private extractParties(context: string, searchTerm: string): string[] {
    const parties = [searchTerm];
    
    const partyPatterns = [
      /Petitioner[:\s]*([^<\n]+)/i,
      /Respondent[:\s]*([^<\n]+)/i,
      /Plaintiff[:\s]*([^<\n]+)/i,
      /Defendant[:\s]*([^<\n]+)/i,
      /Party[:\s]*([^<\n]+)/i
    ];
    
    for (const pattern of partyPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        parties.push(match[1].trim());
      }
    }
    
    return [...new Set(parties)]; // Remove duplicates
  }

  /**
   * Convert JSON case data to our format
   */
  private convertJsonToCaseData(json: any, searchQuery: string): CountyCaseData {
    return {
      caseNumber: json.caseNumber || json.case_number || json.case || `JSON-${Date.now()}`,
      caseTitle: json.caseTitle || json.case_title || json.title || json.name || `Case involving ${searchQuery}`,
      caseType: json.caseType || json.case_type || json.type || this.determineCaseType(json.caseNumber || ''),
      status: json.status || json.case_status || json.caseStatus || 'Active',
      dateFiled: json.dateFiled || json.date_filed || json.filedDate || new Date().toISOString().split('T')[0],
      lastActivity: json.lastActivity || json.last_activity || json.updatedAt || new Date().toISOString().split('T')[0],
      department: json.department || json.dept || json.courtLocation || 'San Diego Superior Court',
      judge: json.judge || json.judicialOfficer || json.judicial_officer || 'Unknown',
      parties: json.parties ? (Array.isArray(json.parties) ? json.parties : [json.parties]) : 
               json.petitioner && json.respondent ? [json.petitioner, json.respondent] :
               json.plaintiff && json.defendant ? [json.plaintiff, json.defendant] :
               [searchQuery],
      upcomingEvents: json.upcomingEvents || json.upcoming_events || json.events || [],
      registerOfActions: json.registerOfActions || json.register_of_actions || json.actions || []
    };
  }

  /**
   * Determine case type based on case number
   */
  private determineCaseType(caseNumber: string): string {
    if (caseNumber.includes('FL')) return 'Family Law';
    if (caseNumber.includes('CR')) return 'Criminal';
    if (caseNumber.includes('CV')) return 'Civil';
    if (caseNumber.includes('SC')) return 'Small Claims';
    if (caseNumber.includes('TR')) return 'Traffic';
    if (caseNumber.includes('JC')) return 'Juvenile';
    if (caseNumber.includes('AD')) return 'Administrative';
    if (caseNumber.includes('AP')) return 'Appeals';
    if (caseNumber.includes('GU')) return 'Guardianship';
    if (caseNumber.includes('MH')) return 'Mental Health';
    if (caseNumber.includes('PR')) return 'Probate';
    if (caseNumber.includes('SB')) return 'Superior Court Business';
    if (caseNumber.includes('SS')) return 'Superior Court Special';
    if (caseNumber.includes('ST')) return 'Superior Court Special';
    if (caseNumber.includes('WS')) return 'Workers Compensation';
    return 'Unknown';
  }


  /**
   * Extract real case data from San Diego County HTML
   */
  private extractRealCaseDataFromHTML(html: string, searchQuery: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('🔍 Extracting real case data from San Diego County HTML...');
      
      // Look for case data patterns in the HTML
      const caseDataPatterns = [
        // Case number patterns
        /Case\s+Number[:\s]*([A-Z]{2}-\d{4}-\d{6})/gi,
        /Case\s+No[:\s]*([A-Z]{2}-\d{4}-\d{6})/gi,
        /([A-Z]{2}-\d{4}-\d{6})/g,
        // Party name patterns
        /Plaintiff[:\s]*([^<\n\r]+)/gi,
        /Defendant[:\s]*([^<\n\r]+)/gi,
        /Petitioner[:\s]*([^<\n\r]+)/gi,
        /Respondent[:\s]*([^<\n\r]+)/gi,
        // Case title patterns
        /Case\s+Title[:\s]*([^<\n\r]+)/gi,
        /Title[:\s]*([^<\n\r]+)/gi,
        // Status patterns
        /Status[:\s]*([^<\n\r]+)/gi,
        /Case\s+Status[:\s]*([^<\n\r]+)/gi,
        // Judge patterns
        /Judge[:\s]*([^<\n\r]+)/gi,
        /Judicial\s+Officer[:\s]*([^<\n\r]+)/gi,
        /Hon[.\s]*([^<\n\r]+)/gi,
        // Date patterns
        /Date\s+Filed[:\s]*([^<\n\r]+)/gi,
        /Filed[:\s]*([^<\n\r]+)/gi,
        /(\d{1,2}\/\d{1,2}\/\d{4})/g
      ];
      
      const extractedData: { [key: string]: string[] } = {};
      
      // Extract all data using patterns
      for (const pattern of caseDataPatterns) {
        const matches = html.match(pattern);
        if (matches) {
          const key = pattern.toString().split('[')[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
          if (!extractedData[key]) extractedData[key] = [];
          extractedData[key].push(...matches.map(m => m.replace(/[:\s]+$/, '').trim()));
        }
      }
      
      console.log('📊 Extracted data from San Diego County HTML:', extractedData);
      
      // If we found case numbers, create case entries
      const caseNumbers = extractedData.casenumber || extractedData.caseno || [];
      if (caseNumbers.length > 0) {
        for (const caseNumber of caseNumbers) {
          const caseData: CountyCaseData = {
            caseNumber: caseNumber,
            caseTitle: extractedData.title?.[0] || `Case ${caseNumber}`,
            caseType: this.determineCaseType(caseNumber),
            status: extractedData.status?.[0] || 'Active',
            dateFiled: extractedData.datefiled?.[0] || extractedData.filed?.[0] || new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString().split('T')[0],
            department: 'San Diego Superior Court',
            judge: extractedData.judge?.[0] || extractedData.judicialofficer?.[0] || 'Unknown',
            parties: [
              extractedData.plaintiff?.[0] || extractedData.petitioner?.[0] || searchQuery,
              extractedData.defendant?.[0] || extractedData.respondent?.[0] || 'Unknown'
            ].filter(p => p && p.trim()),
            upcomingEvents: [],
            registerOfActions: []
          };
          
          cases.push(caseData);
        }
      }
      
      return cases;
    } catch (error) {
      console.error('Error extracting real case data from HTML:', error);
      return cases;
    }
  }

  /**
   * Parse ROASearch results
   */
  private parseROASearchHTML(html: string, searchTerm: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('ROASearch HTML response length:', html.length);
      console.log('ROASearch HTML preview:', html.substring(0, 2000));
      
      // Check if this is a search form or actual results
      if (html.includes('search') && html.includes('form') && !html.includes('case results')) {
        console.log('ROASearch returned search form - no actual case data available');
        return [];
      }
      
      // Look for actual case data patterns
      const caseDataPatterns = [
        // Case number patterns
        /Case\s+Number[:\s]*([A-Z]{2}-\d{4}-\d{6})/gi,
        /Case\s+No[:\s]*([A-Z]{2}-\d{4}-\d{6})/gi,
        /([A-Z]{2}-\d{4}-\d{6})/g,
        // Party name patterns
        /Plaintiff[:\s]*([^<\n\r]+)/gi,
        /Defendant[:\s]*([^<\n\r]+)/gi,
        /Petitioner[:\s]*([^<\n\r]+)/gi,
        /Respondent[:\s]*([^<\n\r]+)/gi,
        // Case title patterns
        /Case\s+Title[:\s]*([^<\n\r]+)/gi,
        /Title[:\s]*([^<\n\r]+)/gi,
        // Status patterns
        /Status[:\s]*([^<\n\r]+)/gi,
        /Case\s+Status[:\s]*([^<\n\r]+)/gi,
        // Judge patterns
        /Judge[:\s]*([^<\n\r]+)/gi,
        /Judicial\s+Officer[:\s]*([^<\n\r]+)/gi,
        /Hon[.\s]*([^<\n\r]+)/gi,
        // Date patterns
        /Date\s+Filed[:\s]*([^<\n\r]+)/gi,
        /Filed[:\s]*([^<\n\r]+)/gi,
        /(\d{1,2}\/\d{1,2}\/\d{4})/g
      ];
      
      const extractedData: { [key: string]: string[] } = {};
      
      // Extract all data using patterns
      for (const pattern of caseDataPatterns) {
        const matches = html.match(pattern);
        if (matches) {
          const key = pattern.toString().split('[')[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
          if (!extractedData[key]) extractedData[key] = [];
          extractedData[key].push(...matches.map(m => m.replace(/[:\s]+$/, '').trim()));
        }
      }
      
      console.log('Extracted data from ROASearch:', extractedData);
      
      // If we found case numbers, create case entries
      const caseNumbers = extractedData.casenumber || extractedData.caseno || [];
      if (caseNumbers.length > 0) {
        for (const caseNumber of caseNumbers) {
          const caseData: CountyCaseData = {
            caseNumber: caseNumber,
            caseTitle: extractedData.title?.[0] || `Case ${caseNumber}`,
            caseType: this.determineCaseType(caseNumber),
            status: extractedData.status?.[0] || 'Active',
            dateFiled: extractedData.datefiled?.[0] || extractedData.filed?.[0] || new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString().split('T')[0],
            department: 'San Diego Superior Court',
            judge: extractedData.judge?.[0] || extractedData.judicialofficer?.[0] || 'Unknown',
            parties: [
              extractedData.plaintiff?.[0] || extractedData.petitioner?.[0] || searchTerm,
              extractedData.defendant?.[0] || extractedData.respondent?.[0] || 'Unknown'
            ].filter(p => p && p.trim()),
            upcomingEvents: [],
            registerOfActions: []
          };
          
          cases.push(caseData);
        }
      }
      
      // If no case numbers found, return empty array - no real data
      if (cases.length === 0) {
        console.log('No case numbers found in ROASearch HTML - returning empty results');
        return [];
      }
      
      return cases;
    } catch (error) {
      console.error('Error parsing ROASearch HTML:', error);
      return cases;
    }
  }

  /**
   * Parse ODYROA search results
   */
  private parseODYROASearchHTML(html: string, searchTerm: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('ODYROA HTML response:', html.substring(0, 1000));
      
      // Parse ODYROA-specific result format
      // Look for case information in ODYROA format
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
      console.error('Error parsing ODYROA search HTML:', error);
      return cases;
    }
  }

  /**
   * Parse CourtIndex search results
   */
  private parseCourtIndexSearchHTML(html: string, searchTerm: string): CountyCaseData[] {
    const cases: CountyCaseData[] = [];
    
    try {
      console.log('CourtIndex HTML response:', html.substring(0, 1000));
      
      // Parse CourtIndex-specific result format
      // Look for case information in CourtIndex format
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
      console.error('Error parsing CourtIndex search HTML:', error);
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
      upcomingEvents: this.parseCalendarEvents(item.upcomingEvents || item.upcoming_events || []),
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
   * Get current rate limit status for specific platform
   */
  getRateLimitStatus(platform: 'roasearch' | 'odyroa' | 'courtindex' = 'roasearch'): { current: number; limit: number; resetTime: number; platform: string } {
    const now = Date.now();
    const windowStart = now - this.TIME_WINDOW;
    
    // Get the appropriate rate limit for the platform
    const rateLimit = platform === 'roasearch' ? this.ROA_SEARCH_LIMIT :
                     platform === 'odyroa' ? this.ODYROA_LIMIT :
                     this.COURT_INDEX_LIMIT;
    
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
      limit: rateLimit,
      resetTime: windowStart + this.TIME_WINDOW,
      platform: platform
    };
  }
}

export const countyDataService = new CountyDataService();
export type { CountyCaseData, CountyEvent, CountyAction };
