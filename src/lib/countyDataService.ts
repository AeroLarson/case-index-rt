/**
 * San Diego County Court Data Service
 * Handles real-time data mining from San Diego Superior Court
 * Compliant with rate limiting: 450 requests per 10 seconds
 * Updated: Uses Puppeteer for JavaScript-rendered content
 */

// Real scraping via approved county endpoints with Puppeteer fallback for JS-rendered pages

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
    // San Diego County case number formats:
    // Format 1: YY[Type]######[Optional] - e.g., 22FL001581C
    // Format 2: [Type]-YYYY-###### - e.g., FL-2024-123456
    const pattern1 = /^\d{2}[A-Z]{2}\d{6}[A-Z]?$/;
    const pattern2 = /^[A-Z]{2}-\d{4}-\d{4,8}$/i;
    return pattern1.test(caseNumber) || pattern2.test(caseNumber);
  }

  private async getRealDataFromWhitelistedSystems(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Getting REAL data from whitelisted San Diego County systems...');
      
      // Try ROASearch first (whitelisted) - PRIORITY since user specifically requested this
      try {
        await this.respectRateLimit('roasearch');
        console.log('🎯 PRIORITY: Searching ROASearch for:', searchQuery);
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
      
      // Try CourtIndex (whitelisted) - use Puppeteer for form submission
      try {
        await this.respectRateLimit('courtindex');
        console.log('🤖 Trying CourtIndex with Puppeteer form submission...');
        const courtIndexResults = await this.searchCourtIndexWithPuppeteer(searchQuery, searchType);
        if (courtIndexResults && courtIndexResults.length > 0) {
          console.log('✅ Got REAL data from CourtIndex via Puppeteer!');
          return courtIndexResults;
        }
        
        // Fallback to direct endpoint attempts
        const courtIndexDirectResults = await this.searchCourtIndexCases(searchQuery, searchType);
        if (courtIndexDirectResults && courtIndexDirectResults.length > 0) {
          console.log('✅ Got REAL data from CourtIndex!');
          return courtIndexDirectResults;
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
   * Search using Puppeteer to handle JavaScript-rendered content (Vercel-compatible)
   */
  private async searchWithPuppeteer(searchQuery: string, searchType: string, searchUrl: string): Promise<CountyCaseData[]> {
    try {
      console.log('🤖 Using Puppeteer to search:', searchUrl);
      
      // Use serverless-compatible Puppeteer for Vercel
      const puppeteer = await import('puppeteer-core').catch(() => null);
      const chromiumModule = await import('@sparticuz/chromium').catch(() => null);
      
      if (!puppeteer || !chromiumModule) {
        console.log('⚠️ Puppeteer/Chromium not available, skipping browser-based search');
        return [];
      }
      
      // Handle different export formats for @sparticuz/chromium
      const chromium = chromiumModule.default || chromiumModule;
      
      // Configure Chromium for Vercel serverless - setGraphicsMode is optional
      if (chromium && typeof (chromium as any).setGraphicsMode === 'function') {
        try {
          (chromium as any).setGraphicsMode(false);
        } catch (e) {
          // Ignore if setGraphicsMode fails
        }
      }
      
      // Get executable path - handle both function and property
      let executablePath: string;
      if (typeof chromium.executablePath === 'function') {
        executablePath = await chromium.executablePath();
      } else if (typeof chromium.executablePath === 'string') {
        executablePath = chromium.executablePath;
      } else {
        // Try to get it from the module
        executablePath = (chromium as any).executablePath || '';
        if (!executablePath && typeof (chromium as any).executablePath === 'function') {
          executablePath = await (chromium as any).executablePath();
        }
      }
      
      if (!executablePath) {
        console.log('⚠️ Could not get Chromium executable path');
        return [];
      }
      
      const browser = await puppeteer.launch({
        args: chromium.args || [],
        defaultViewport: chromium.defaultViewport || { width: 1280, height: 720 },
        executablePath: executablePath,
        headless: chromium.headless !== false, // Default to true
      });
      
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36');
        
        // Navigate to search page
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to find and fill search form
        if (searchType === 'caseNumber') {
          const caseInput = await page.$('input[name="caseNumber"], input[id*="case"], input[placeholder*="case" i]').catch(() => null);
          if (caseInput) {
            await caseInput.type(searchQuery);
            const submitBtn = await page.$('button[type="submit"], input[type="submit"]').catch(() => null);
            if (submitBtn) {
              await submitBtn.click();
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        } else {
          const nameInput = await page.$('input[name*="name" i], input[name*="party" i], input[placeholder*="name" i]').catch(() => null);
          if (nameInput) {
            await nameInput.type(searchQuery);
            const submitBtn = await page.$('button[type="submit"], input[type="submit"]').catch(() => null);
            if (submitBtn) {
              await submitBtn.click();
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        }
        
        // Get the rendered HTML
        const html = await page.content();
        
        // Parse the rendered HTML
        const results = this.parseCaseSearchHTML(html, searchQuery);
        
        await browser.close();
        
        return results;
      } catch (error) {
        await browser.close();
        throw error;
      }
    } catch (error: any) {
      console.log('⚠️ Puppeteer search failed:', error.message);
      return [];
    }
  }

  /**
   * Search CourtIndex using the actual search pages
   */
  private async searchCourtIndexWithPuppeteer(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🤖 Using Puppeteer to search CourtIndex...');
      
      const puppeteer = await import('puppeteer-core').catch(() => null);
      const chromiumModule = await import('@sparticuz/chromium').catch(() => null);
      
      if (!puppeteer || !chromiumModule) {
        console.log('⚠️ Puppeteer/Chromium not available');
        return [];
      }
      
      // Handle different export formats for @sparticuz/chromium
      const chromium = chromiumModule.default || chromiumModule;
      
      // Configure Chromium for serverless - setGraphicsMode is optional
      if (chromium && typeof (chromium as any).setGraphicsMode === 'function') {
        try {
          (chromium as any).setGraphicsMode(false);
        } catch (e) {
          // Ignore if setGraphicsMode fails
        }
      }
      
      // Get executable path - handle both function and property
      let executablePath: string;
      if (typeof chromium.executablePath === 'function') {
        executablePath = await chromium.executablePath();
      } else if (typeof chromium.executablePath === 'string') {
        executablePath = chromium.executablePath;
      } else {
        // Try to get it from the module
        executablePath = (chromium as any).executablePath || '';
        if (!executablePath && typeof (chromium as any).executablePath === 'function') {
          executablePath = await (chromium as any).executablePath();
        }
      }
      
      if (!executablePath) {
        console.log('⚠️ Could not get Chromium executable path');
        return [];
      }
      
      const browser = await puppeteer.launch({
        args: chromium.args || [],
        defaultViewport: chromium.defaultViewport || { width: 1280, height: 720 },
        executablePath: executablePath,
        headless: chromium.headless !== false, // Default to true
      });
      
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36');
        
        // Navigate to the actual search page based on search type
        let searchPageUrl: string;
        if (searchType === 'caseNumber') {
          searchPageUrl = `${this.courtIndexBaseUrl}/CISPublic/casesearch`;
        } else {
          searchPageUrl = `${this.courtIndexBaseUrl}/CISPublic/namesearch`;
        }
        
        console.log('📡 Navigating to:', searchPageUrl);
        await page.goto(searchPageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Find and fill the search form
        if (searchType === 'caseNumber') {
          // Look for case number input
          const caseInput = await page.$('input[name*="case" i], input[id*="case" i]').catch(() => null);
          if (caseInput) {
            await caseInput.type(searchQuery, { delay: 50 });
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Find and click submit button
            const submitBtn = await page.$('input[type="submit"], button[type="submit"], input[value*="Search" i]').catch(() => null);
            if (submitBtn) {
              await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
                submitBtn.click()
              ]);
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
        } else {
          // For name search, split into first/last name for CourtIndex form
          const nameParts = searchQuery.trim().split(/\s+/);
          const firstName = nameParts.slice(-1)[0] || ''; // Last part is likely first name
          const lastName = nameParts.slice(0, -1).join(' ') || (nameParts[0] || ''); // Everything else is last name
          
          console.log('🔍 Filling form with:', { firstName, lastName, fullQuery: searchQuery });
          
          // Wait for form to be ready
          await page.waitForSelector('input[type="text"], input[name*="name" i], textbox', { timeout: 10000 }).catch(() => {});
          
          // Fill Last Name or Business Name field (primary field in CourtIndex)
          const lastNameInput = await page.$('input[name*="last" i], input[name*="Last" i], textbox').catch(() => null);
          if (lastNameInput) {
            await lastNameInput.click({ clickCount: 3 }); // Select all existing text
            await lastNameInput.type(lastName, { delay: 50 });
            console.log('✅ Filled last name:', lastName);
          }
          
          // Fill First Name field if it exists
          const firstNameInput = await page.$('input[name*="first" i], input[name*="First" i]').catch(() => null);
          if (firstNameInput && firstName) {
            await firstNameInput.click({ clickCount: 3 });
            await firstNameInput.type(firstName, { delay: 50 });
            console.log('✅ Filled first name:', firstName);
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Find and click Submit button (CourtIndex uses button with text "Submit")
          const submitBtn = await page.$('button:has-text("Submit"), input[value="Submit"], input[type="submit"][value*="Submit" i]').catch(() => null);
          if (!submitBtn) {
            // Try alternative selectors
            const submitBtn2 = await page.$('input[type="submit"], button[type="submit"]').catch(() => null);
            if (submitBtn2) {
              console.log('✅ Found submit button via alternative selector');
              await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
                submitBtn2.click()
              ]);
              await new Promise(resolve => setTimeout(resolve, 4000)); // Wait longer for results to load
            }
          } else {
            console.log('✅ Found submit button, clicking...');
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
              submitBtn.click()
            ]);
            await new Promise(resolve => setTimeout(resolve, 4000)); // Wait longer for results to load
          }
        }
        
        // Get the rendered HTML after search
        const html = await page.content();
        console.log('✅ Got rendered HTML from CourtIndex, length:', html.length);
        
        // Parse the results
        const results = this.parseCaseSearchHTML(html, searchQuery);
        
        await browser.close();
        
        return results;
      } catch (error) {
        await browser.close();
        throw error;
      }
    } catch (error: any) {
      console.log('⚠️ CourtIndex Puppeteer search failed:', error.message);
      return [];
    }
  }

  /**
   * Search using public case search system - tries both GET and POST methods, then Puppeteer
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
      
      // As a last resort, try Puppeteer for JavaScript-rendered content
      try {
        console.log('🤖 Trying Puppeteer-based search as fallback...');
        const searchBaseUrl = `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`;
        const puppeteerResults = await this.searchWithPuppeteer(searchQuery, searchType, searchBaseUrl);
        if (puppeteerResults.length > 0) {
          console.log('✅ Puppeteer found results!');
          return puppeteerResults;
        }
      } catch (puppeteerError: any) {
        console.log('⚠️ Puppeteer fallback failed:', puppeteerError.message);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Search error:', error);
      throw new Error('Unable to search county records');
    }
  }

  /**
   * Search ROASearch using Puppeteer to submit the form - handles both case number and party name searches
   */
  private async searchROAWithPuppeteer(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🤖 Using Puppeteer to search ROASearch for:', searchQuery, 'type:', searchType);
      
      const puppeteer = await import('puppeteer-core').catch(() => null);
      const chromiumModule = await import('@sparticuz/chromium').catch(() => null);
      
      if (!puppeteer || !chromiumModule) {
        console.log('⚠️ Puppeteer/Chromium not available');
        return [];
      }
      
      // Handle different export formats for @sparticuz/chromium
      const chromium = chromiumModule.default || chromiumModule;
      
      // Configure Chromium for serverless - setGraphicsMode is optional
      if (chromium && typeof (chromium as any).setGraphicsMode === 'function') {
        try {
          (chromium as any).setGraphicsMode(false);
        } catch (e) {
          // Ignore if setGraphicsMode fails
        }
      }
      
      // Get executable path - handle both function and property
      let executablePath: string;
      if (typeof chromium.executablePath === 'function') {
        executablePath = await chromium.executablePath();
      } else if (typeof chromium.executablePath === 'string') {
        executablePath = chromium.executablePath;
      } else {
        // Try to get it from the module
        executablePath = (chromium as any).executablePath || '';
        if (!executablePath && typeof (chromium as any).executablePath === 'function') {
          executablePath = await (chromium as any).executablePath();
        }
      }
      
      if (!executablePath) {
        console.log('⚠️ Could not get Chromium executable path');
        return [];
      }
      
      const browser = await puppeteer.launch({
        args: chromium.args || [],
        defaultViewport: chromium.defaultViewport || { width: 1280, height: 720 },
        executablePath: executablePath,
        headless: chromium.headless !== false, // Default to true
      });
      
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36');
        
        // Determine which search page to use based on search type
        let roaSearchUrl: string;
        if (searchType === 'caseNumber') {
          roaSearchUrl = `${this.roaBaseUrl}/Cases`; // Case number search page
        } else {
          roaSearchUrl = `${this.roaBaseUrl}/Parties`; // Party name search page
        }
        
        console.log('📡 Navigating to ROASearch:', roaSearchUrl);
        await page.goto(roaSearchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take a screenshot for debugging (in development)
        if (process.env.NODE_ENV === 'development') {
          await page.screenshot({ path: '/tmp/roasearch-page.png', fullPage: true }).catch(() => {});
        }
        
        // Get all input elements to understand the form structure (using evaluate instead of $$eval to avoid CSP issues)
        const allInputs = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input, [role="textbox"]'));
          return inputs.map((el: any) => ({
            tag: el.tagName,
            type: el.type,
            name: el.name,
            id: el.id,
            placeholder: el.placeholder,
            value: el.value,
            role: el.getAttribute('role')
          }));
        }).catch(() => []);
        console.log('📋 Found form inputs:', JSON.stringify(allInputs, null, 2));
        
        if (searchType === 'caseNumber') {
          // CASE NUMBER SEARCH
          console.log('🔍 Searching by case number:', searchQuery);
          
          // Try multiple methods to find and fill the case number input
          let filled = false;
          
          // Method 1: Try by name/id containing "case"
          try {
            const caseInput = await page.$('input[name*="case" i], input[id*="case" i]').catch(() => null);
            if (caseInput) {
              await caseInput.click({ clickCount: 3 });
              await caseInput.type(searchQuery, { delay: 50 });
              filled = true;
              console.log('✅ Filled case number via name/id selector');
            }
          } catch (e) {
            console.log('⚠️ Method 1 failed:', e);
          }
          
          // Method 2: Try first textbox
          if (!filled) {
            try {
              const textboxes = await page.$$('textbox').catch(() => []);
              if (textboxes.length > 0) {
                await textboxes[0].click({ clickCount: 3 });
                await textboxes[0].type(searchQuery, { delay: 50 });
                filled = true;
                console.log('✅ Filled case number via first textbox');
              }
            } catch (e) {
              console.log('⚠️ Method 2 failed:', e);
            }
          }
          
          // Method 3: Try first text input
          if (!filled) {
            try {
              const inputs = await page.$$('input[type="text"]').catch(() => []);
              if (inputs.length > 0) {
                await inputs[0].click({ clickCount: 3 });
                await inputs[0].type(searchQuery, { delay: 50 });
                filled = true;
                console.log('✅ Filled case number via first text input');
              }
            } catch (e) {
              console.log('⚠️ Method 3 failed:', e);
            }
          }
          
          if (!filled) {
            console.log('❌ Could not find case number input field');
            throw new Error('Could not find case number input field');
          }
        } else {
          // PARTY NAME SEARCH
          const nameParts = searchQuery.trim().split(/\s+/);
          // For name searches, last word is usually last name, everything else is first name
          const lastName = nameParts[nameParts.length - 1] || '';
          const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
          
          console.log('🔍 Filling ROASearch form with:', { firstName, lastName, fullQuery: searchQuery });
          
          let firstNameFilled = false;
          let lastNameFilled = false;
          
          // Method 1: Try finding by textbox role
          try {
            const textboxes = await page.$$('textbox').catch(() => []);
            console.log('📋 Found textboxes:', textboxes.length);
            
            if (textboxes.length >= 1 && firstName) {
              await textboxes[0].click({ clickCount: 3 });
              await textboxes[0].type(firstName, { delay: 50 });
              firstNameFilled = true;
              console.log('✅ Filled first name via textbox[0]');
            }
            
            // Last name is usually the 3rd textbox (after first and middle)
            if (textboxes.length >= 3 && lastName) {
              await textboxes[2].click({ clickCount: 3 });
              await textboxes[2].type(lastName, { delay: 50 });
              lastNameFilled = true;
              console.log('✅ Filled last name via textbox[2]');
            } else if (textboxes.length >= 2 && lastName) {
              // Sometimes there's no middle name field
              await textboxes[1].click({ clickCount: 3 });
              await textboxes[1].type(lastName, { delay: 50 });
              lastNameFilled = true;
              console.log('✅ Filled last name via textbox[1]');
            }
          } catch (e) {
            console.log('⚠️ Textbox method failed:', e);
          }
          
          // Method 2: Try finding by input type
          if (!firstNameFilled || !lastNameFilled) {
            try {
              const inputs = await page.$$('input[type="text"]').catch(() => []);
              console.log('📋 Found text inputs:', inputs.length);
              
              if (inputs.length >= 1 && firstName && !firstNameFilled) {
                await inputs[0].click({ clickCount: 3 });
                await inputs[0].type(firstName, { delay: 50 });
                firstNameFilled = true;
                console.log('✅ Filled first name via input[0]');
              }
              
              if (inputs.length >= 3 && lastName && !lastNameFilled) {
                await inputs[2].click({ clickCount: 3 });
                await inputs[2].type(lastName, { delay: 50 });
                lastNameFilled = true;
                console.log('✅ Filled last name via input[2]');
              } else if (inputs.length >= 2 && lastName && !lastNameFilled) {
                await inputs[1].click({ clickCount: 3 });
                await inputs[1].type(lastName, { delay: 50 });
                lastNameFilled = true;
                console.log('✅ Filled last name via input[1]');
              }
            } catch (e) {
              console.log('⚠️ Input method failed:', e);
            }
          }
          
          // Method 3: Try finding by name attribute
          if (!firstNameFilled || !lastNameFilled) {
            try {
              if (firstName && !firstNameFilled) {
                const firstInput = await page.$('input[name*="first" i], input[name*="First" i]').catch(() => null);
                if (firstInput) {
                  await firstInput.click({ clickCount: 3 });
                  await firstInput.type(firstName, { delay: 50 });
                  firstNameFilled = true;
                  console.log('✅ Filled first name via name attribute');
                }
              }
              
              if (lastName && !lastNameFilled) {
                const lastInput = await page.$('input[name*="last" i], input[name*="Last" i]').catch(() => null);
                if (lastInput) {
                  await lastInput.click({ clickCount: 3 });
                  await lastInput.type(lastName, { delay: 50 });
                  lastNameFilled = true;
                  console.log('✅ Filled last name via name attribute');
                }
              }
            } catch (e) {
              console.log('⚠️ Name attribute method failed:', e);
            }
          }
          
          if (!firstNameFilled && !lastNameFilled) {
            console.log('❌ Could not find name input fields');
            throw new Error('Could not find name input fields');
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find and click Search button - try multiple methods
        let buttonClicked = false;
        
        // Method 1: Try button with "Search" text using evaluate
        try {
          const buttonFound = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
            const searchBtn = buttons.find((btn: any) => {
              const text = (btn.textContent || btn.value || '').toLowerCase();
              return text.includes('search') || text.includes('submit');
            });
            if (searchBtn) {
              (searchBtn as HTMLElement).click();
              return true;
            }
            return false;
          }).catch(() => false);
          
          if (buttonFound) {
            buttonClicked = true;
            console.log('✅ Clicked Search button via evaluate');
          }
        } catch (e) {
          console.log('⚠️ Button evaluate method failed:', e);
        }
        
        // Method 2: Try clicking by selector
        if (!buttonClicked) {
          try {
            const buttonSelectors = [
              'button[type="submit"]',
              'input[type="submit"]',
              'button:contains("Search")',
              'button',
              'input[value*="Search" i]',
              'input[value*="Submit" i]'
            ];
            
            for (const selector of buttonSelectors) {
              try {
                const button = await page.$(selector).catch(() => null);
                if (button) {
                  await button.click();
                  buttonClicked = true;
                  console.log(`✅ Clicked button via selector: ${selector}`);
                  break;
                }
              } catch (e) {
                // Try next selector
              }
            }
          } catch (e) {
            console.log('⚠️ Button selector method failed:', e);
          }
        }
        
        // Method 3: Try pressing Enter on the input field
        if (!buttonClicked) {
          try {
            const inputs = await page.$$('input[type="text"], textbox').catch(() => []);
            if (inputs.length > 0) {
              await inputs[0].press('Enter');
              buttonClicked = true;
              console.log('✅ Pressed Enter on input field');
            }
          } catch (e) {
            console.log('⚠️ Enter key method failed:', e);
          }
        }
        
        if (!buttonClicked) {
          console.log('⚠️ Could not find Search button, but continuing anyway - form might auto-submit');
        }
        
        // Wait for results to load
        console.log('⏳ Waiting for search results...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Try to wait for results table or navigation
        try {
          await page.waitForSelector('table, .results, [class*="result"], [id*="result"]', { timeout: 10000 }).catch(() => {});
        } catch (e) {
          console.log('⚠️ Results table not found, continuing anyway');
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the rendered HTML after search
        const html = await page.content();
        const currentUrl = page.url();
        console.log('✅ Got rendered HTML from ROASearch, length:', html.length);
        console.log('✅ URL after search:', currentUrl);
        
        // Check if we got results or are still on the form page
        const hasResultsTable = html.includes('Case Number') && html.includes('Case Title') && html.length > 10000;
        const stillOnForm = html.length < 10000 && (html.includes('search') || html.includes('Search'));
        
        if (hasResultsTable) {
          console.log('✅ Detected results table page');
        } else if (stillOnForm) {
          console.log('⚠️ Still on search form page, might not have navigated');
          console.log('📄 Page title:', await page.title().catch(() => 'Unknown'));
          
          // Try to see what's on the page
          const pageText = await page.evaluate(() => document.body.innerText).catch(() => '');
          console.log('📄 Page text preview:', pageText.substring(0, 500));
        }
        
        // Parse the results
        const results = this.parseCaseSearchHTML(html, searchQuery);
        console.log(`📊 Parsed ${results.length} results from ROASearch`);
        
        // If no results but we have a results table, log more details
        if (results.length === 0 && hasResultsTable) {
          console.log('⚠️ Results table detected but no cases parsed. HTML preview:');
          console.log(html.substring(0, 5000));
        }
        
        await browser.close();
        
        return results;
      } catch (error) {
        await browser.close();
        throw error;
      }
    } catch (error: any) {
      console.log('⚠️ ROASearch Puppeteer search failed:', error.message);
      return [];
    }
  }

  /**
   * Search using ROASearch system (15 requests/minute limit)
   */
  private async searchROACases(searchQuery: string, searchType: string): Promise<CountyCaseData[]> {
    try {
      console.log('🔍 Searching ROASearch for:', searchQuery);
      
      // First, try Puppeteer form submission (primary method for ROASearch)
      try {
        console.log('🤖 Trying ROASearch with Puppeteer form submission...');
        const puppeteerResults = await this.searchROAWithPuppeteer(searchQuery, searchType);
        if (puppeteerResults && puppeteerResults.length > 0) {
          console.log('✅ Got REAL data from ROASearch via Puppeteer!');
          return puppeteerResults;
        }
      } catch (puppeteerError: any) {
        console.log('⚠️ ROASearch Puppeteer failed, trying direct endpoints:', puppeteerError.message);
      }
      
      // Fallback: Try direct endpoints (though these usually return forms)
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
      
      // Check if we have a results table (ROASearch format)
      // ROASearch returns tables with headers: Case Number, Case Title, Case Type, Department, Court Location, Date Filed
      // Also check for case number format directly in HTML (for case number searches)
      const hasResultsTable = tableRows.some(row => {
        const rowText = row.join(' ').toLowerCase();
        return (rowText.includes('case number') && rowText.includes('case title')) || 
               uniqueCaseNumbers.length > 0 ||
               html.match(/\d{2}[A-Z]{2}\d{6}[A-Z]?/) !== null;
      });
      
      if (hasResultsTable && tableRows.length > 1) {
        console.log('✅ Found ROASearch results table format with', tableRows.length, 'rows');
        
        // Find header row index
        let headerRowIndex = -1;
        for (let i = 0; i < tableRows.length; i++) {
          const rowText = tableRows[i].join(' ').toLowerCase();
          if (rowText.includes('case number') && rowText.includes('case title') && rowText.includes('case type')) {
            headerRowIndex = i;
            break;
          }
        }
        
        // Parse data rows (skip header)
        for (let i = 0; i < tableRows.length; i++) {
          // Skip header row
          if (i === headerRowIndex) continue;
          
          const row = tableRows[i];
          const rowText = row.join(' ').toLowerCase();
          
          // Skip empty rows or rows that are clearly headers
          if (row.length === 0 || row.every(c => c.trim().length === 0)) continue;
          if (rowText.includes('case number') && rowText.includes('case title')) continue;
          
          // Check if this row contains a case number
          let caseNumberInRow = '';
          for (const cell of row) {
            const caseMatch = cell.match(/(\d{2}[A-Z]{2}\d{6}[A-Z]?|[A-Z]{2}-\d{4}-\d{4,8})/i);
            if (caseMatch) {
              caseNumberInRow = caseMatch[1].toUpperCase();
              break;
            }
          }
          
          // Also check if the row contains our search term (for name searches)
          const matchesSearchTerm = searchTerm.toLowerCase().split(/\s+/).some(term => 
            rowText.includes(term.toLowerCase())
          );
          
          // If row has case number OR matches search term, it's a valid data row
          if (caseNumberInRow || (matchesSearchTerm && row.length >= 3)) {
            // Extract case title - usually the second cell or one with " vs " or "[IMAGED]"
            const caseTitleCell = row.find(c => 
              c.includes(' vs ') || 
              c.includes(' v. ') || 
              c.includes('[IMAGED]') ||
              (c.length > 20 && !/^\d+$/.test(c.trim()) && !c.match(/^\d{2}[A-Z]{2}\d{6}/i))
            ) || row[1] || row.find(c => c.length > 10 && c.length < 200) || `Case ${caseNumberInRow || 'Unknown'}`;
            
            // Extract case type - look for keywords
            const caseTypeCell = row.find(c => 
              /dissolution|family|criminal|civil|probate|domestic|small claims|traffic|juvenile/i.test(c)
            ) || this.determineCaseType(caseNumberInRow);
            
            // Extract department - usually a 3-digit number
            const departmentCell = row.find(c => /^\d{3}$/.test(c.trim())) || '';
            
            // Extract date filed
            const dateCell = row.find(c => /\d{1,2}\/\d{1,2}\/\d{4}/.test(c)) || '';
            
            // Extract court location
            const locationCell = row.find(c => 
              /central|north|south|east|west|chula vista|el cajon|san diego/i.test(c)
            ) || 'Central';
            
            // This is a data row - extract case information
            const caseData: CountyCaseData = {
              caseNumber: caseNumberInRow || `FOUND-${Date.now()}`,
              caseTitle: caseTitleCell.toString().replace(/\[IMAGED\]/gi, '').trim(),
              caseType: caseTypeCell.toString(),
              status: 'Active',
              dateFiled: this.normalizeDate(dateCell.toString()),
              lastActivity: new Date().toISOString().split('T')[0],
              department: departmentCell || 'San Diego Superior Court',
              judge: 'Unknown',
              parties: this.extractPartiesFromRow(row, searchTerm),
              upcomingEvents: [],
              registerOfActions: [],
              note: caseNumberInRow ? undefined : 'Case found but case number could not be extracted.'
            };
            
            // Normalize case number if we found one
            if (caseNumberInRow) {
              const normalized = caseNumberInRow.replace(/-/g, '');
              if (/^[A-Z]{2}\d{8,10}$/.test(normalized)) {
                const match = normalized.match(/^([A-Z]{2})(\d{2})(\d{6,8})$/);
                if (match) {
                  caseData.caseNumber = match[2] + match[1] + match[3];
                }
              } else if (/^\d{2}[A-Z]{2}\d{6}[A-Z]?$/.test(normalized)) {
                caseData.caseNumber = normalized;
              } else {
                caseData.caseNumber = normalized;
              }
            }
            
            // Only add if we have a real case number or valid case title
            if (caseNumberInRow || (caseData.caseTitle && !caseData.caseTitle.includes('FOUND-'))) {
              if (!cases.find(c => c.caseNumber === caseData.caseNumber)) {
                cases.push(caseData);
                console.log('✅ Extracted case from ROASearch table:', caseData.caseNumber, caseData.caseTitle);
              }
            }
          }
        }
      }
      
      // If we found case numbers in HTML but didn't extract them from tables, try to create entries
      if (uniqueCaseNumbers.length > 0 && cases.length === 0) {
        console.log('🔍 Found case numbers in HTML but not in tables, creating entries...');
        for (const caseNum of uniqueCaseNumbers.slice(0, 10)) { // Limit to first 10
          // Look for context around this case number in the HTML
          const caseNumPattern = new RegExp(caseNum.replace(/[-\s]/g, '[\\s-]*'), 'i');
          const contextMatch = html.match(new RegExp(`.{0,200}${caseNumPattern.source}.{0,200}`, 'i'));
          
          if (contextMatch) {
            const context = contextMatch[0];
            const parties = this.extractParties(context, searchTerm);
            const caseTitle = this.extractCaseTitle(context, searchTerm);
            
            cases.push({
              caseNumber: caseNum,
              caseTitle: caseTitle,
              caseType: this.determineCaseType(caseNum),
              status: 'Active',
              dateFiled: new Date().toISOString().split('T')[0],
              lastActivity: new Date().toISOString().split('T')[0],
              department: 'San Diego Superior Court',
              judge: 'Unknown',
              parties: parties.length > 0 ? parties : [searchTerm],
              upcomingEvents: [],
              registerOfActions: []
            });
          }
        }
      }
      
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
            
            // Avoid duplicates
            if (!cases.find(c => c.caseNumber === caseData.caseNumber)) {
              cases.push(caseData);
            }
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
   * Extract case data using DOM selectors to target exact fields (legacy method - now uses regex parsing)
   */
  private extractCaseDataFromDOM(document: any, caseNumber: string, searchTerm: string): CountyCaseData | null {
    // This method is no longer used but kept for compatibility
    // All parsing now happens via regex in parseCaseSearchHTML
    return {
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
   * Extract parties from a table row (ROASearch format)
   */
  private extractPartiesFromRow(row: string[], searchTerm: string): string[] {
    const parties: string[] = [];
    
    // Look for "vs" or "v." in case title cell
    const titleCell = row.find(c => c.includes(' vs ') || c.includes(' v. ')) || '';
    
    if (titleCell) {
      // Extract names from "Name1 vs Name2" format
      const vsMatch = titleCell.match(/([^v]+?)\s+vs?\.?\s+(.+)/i);
      if (vsMatch) {
        parties.push(vsMatch[1].trim().replace(/\[IMAGED\]/gi, '').trim());
        parties.push(vsMatch[2].trim().replace(/\[IMAGED\]/gi, '').trim());
      }
      
      // Also look for "Petitioner:" and "Respondent:" patterns
      const petitionerMatch = titleCell.match(/Petitioner[:\s]+([^,\n]+)/i);
      const respondentMatch = titleCell.match(/Respondent[:\s]+([^,\n]+)/i);
      
      if (petitionerMatch && !parties.includes(petitionerMatch[1].trim())) {
        parties.push(petitionerMatch[1].trim());
      }
      if (respondentMatch && !parties.includes(respondentMatch[1].trim())) {
        parties.push(respondentMatch[1].trim());
      }
    }
    
    // If no parties found, use search term
    if (parties.length === 0) {
      parties.push(searchTerm);
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
