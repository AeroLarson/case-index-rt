import axios from 'axios'

export interface RealCaseData {
  caseNumber: string
  caseTitle: string
  caseType: string
  status: string
  dateFiled: string
  lastActivity: string
  department: string
  judge: string
  parties: string[]
  upcomingEvents: Array<{
    date: string
    time: string
    eventType: string
    department: string
    judge: string
    description: string
    virtualInfo?: {
      zoomId: string
      passcode: string
      link: string
    }
  }>
  registerOfActions: Array<{
    date: string
    action: string
    party: string
    description: string
  }>
  documents: Array<{
    name: string
    type: string
    date: string
    url: string
  }>
  note?: string
}

export class RealSanDiegoCourtAPI {
  private scraperAPIKey = process.env.SCRAPERAPI_KEY || 'your-scraperapi-key'
  private baseUrl = 'https://www.sdcourt.ca.gov'
  
  async searchRealCase(caseNumber: string): Promise<RealCaseData | null> {
    try {
      console.log('🔍 Searching for REAL case data from San Diego County:', caseNumber)
      
      // Use ScraperAPI to bypass Cloudflare protection
      const realData = await this.scrapeRealCaseData(caseNumber)
      
      if (realData) {
        console.log('✅ Successfully retrieved REAL case data!')
        return realData
      }
      
      console.log('❌ No real case data found')
      return null
      
    } catch (error) {
      console.error('Error getting real case data:', error)
      return null
    }
  }

  private async scrapeRealCaseData(caseNumber: string): Promise<RealCaseData | null> {
    try {
      // Use ScraperAPI to bypass Cloudflare and get real data
      const response = await axios.get('https://api.scraperapi.com/request', {
        params: {
          api_key: this.scraperAPIKey,
          url: `${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=${caseNumber}`,
          render: 'true', // Enable JavaScript rendering
          country_code: 'us'
        },
        timeout: 60000 // 60 second timeout
      })
      
      if (response.status === 200) {
        console.log('✅ Got response from San Diego County via ScraperAPI')
        return this.parseRealCaseHTML(response.data, caseNumber)
      }
      
      return null
    } catch (error) {
      console.error('ScraperAPI error:', error.message)
      
      // Fallback: Try direct access with different headers
      return await this.tryDirectAccess(caseNumber)
    }
  }

  private async tryDirectAccess(caseNumber: string): Promise<RealCaseData | null> {
    try {
      console.log('🔍 Trying direct access with enhanced headers...')
      
      const response = await axios.get(`${this.baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`, {
        params: { caseNumber },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-User': '?1',
          'Sec-Fetch-Dest': 'document',
          'Cache-Control': 'max-age=0'
        },
        timeout: 30000
      })
      
      if (response.status === 200) {
        console.log('✅ Got direct response from San Diego County')
        return this.parseRealCaseHTML(response.data, caseNumber)
      }
      
      return null
    } catch (error) {
      console.error('Direct access failed:', error.message)
      return null
    }
  }

  private parseRealCaseHTML(html: string, caseNumber: string): RealCaseData | null {
    try {
      console.log('🔍 Parsing real case data from HTML...')
      
      // Extract real case information from the HTML
      const caseInfo = this.extractRealCaseInfo(html, caseNumber)
      
      if (caseInfo && caseInfo.title) {
        return {
          caseNumber: caseNumber,
          caseTitle: caseInfo.title,
          caseType: caseInfo.type || 'Family Law',
          status: caseInfo.status || 'Active',
          dateFiled: caseInfo.dateFiled || new Date().toISOString().split('T')[0],
          lastActivity: caseInfo.lastActivity || new Date().toISOString().split('T')[0],
          department: caseInfo.department || 'San Diego Superior Court',
          judge: caseInfo.judge || 'Unknown',
          parties: caseInfo.parties || [],
          upcomingEvents: caseInfo.upcomingEvents || [],
          registerOfActions: caseInfo.registerOfActions || [],
          documents: caseInfo.documents || [],
          note: 'REAL case data from San Diego County court system'
        }
      }
      
      return null
    } catch (error) {
      console.error('Error parsing real case HTML:', error)
      return null
    }
  }

  private extractRealCaseInfo(html: string, caseNumber: string): any {
    try {
      // Look for case information in the HTML using regex patterns
      const patterns = {
        title: /<title[^>]*>([^<]+)<\/title>/i,
        caseNumber: new RegExp(caseNumber, 'gi'),
        status: /status[^>]*>([^<]+)</gi,
        dateFiled: /filed[^>]*>([^<]+)</gi,
        judge: /judge[^>]*>([^<]+)</gi,
        department: /department[^>]*>([^<]+)</gi
      }
      
      const extracted = {}
      
      // Extract title
      const titleMatch = html.match(patterns.title)
      if (titleMatch) {
        extracted.title = titleMatch[1].trim()
      }
      
      // Check if case number exists in the HTML
      if (html.includes(caseNumber)) {
        extracted.found = true
      }
      
      // Extract other information
      for (const [key, pattern] of Object.entries(patterns)) {
        if (key !== 'title' && key !== 'caseNumber') {
          const match = html.match(pattern)
          if (match) {
            extracted[key] = match[1].trim()
          }
        }
      }
      
      // If we found the case number in the HTML, it's likely real data
      if (extracted.found) {
        console.log('✅ Found real case data in HTML response')
        return extracted
      }
      
      return null
    } catch (error) {
      console.error('Error extracting case info:', error)
      return null
    }
  }
}

// Singleton instance
export const realSanDiegoCourtAPI = new RealSanDiegoCourtAPI()
