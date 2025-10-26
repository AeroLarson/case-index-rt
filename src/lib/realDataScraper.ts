import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin())

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
  note?: string
}

export class RealDataScraper {
  private browser: any = null

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false, // Set to false to see what's happening
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      })
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async searchRealCase(caseNumber: string): Promise<RealCaseData | null> {
    await this.init()
    
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage()
    
    try {
      console.log('🔍 Starting real data scraping for case:', caseNumber)
      
      // Set realistic viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 })
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
      
      // Set extra headers to look more like a real browser
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Cache-Control': 'max-age=0'
      })

      // Try multiple San Diego County court systems
      const courtSystems = [
        'https://courtindex.sdcourt.ca.gov/CISPublic/enter',
        'https://roasearch.sdcourt.ca.gov/',
        'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch'
      ]

      for (const courtUrl of courtSystems) {
        try {
          console.log(`🔍 Trying court system: ${courtUrl}`)
          
          await page.goto(courtUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
          })
          
          // Wait for page to fully load
          await page.waitForTimeout(5000)
          
          // Take screenshot for debugging
          await page.screenshot({ path: `debug-${Date.now()}.png` })
          console.log('📸 Screenshot saved for debugging')
          
          // Check if we got past Cloudflare
          const pageContent = await page.content()
          console.log('📄 Page content length:', pageContent.length)
          
          if (pageContent.includes('challenge') || pageContent.includes('cloudflare')) {
            console.log('❌ Cloudflare challenge detected, trying next system...')
            continue
          }
          
          // Look for case search form
          const searchForm = await this.findCaseSearchForm(page)
          if (searchForm) {
            console.log('✅ Found case search form, attempting search...')
            
            const result = await this.performCaseSearch(page, caseNumber)
            if (result) {
              console.log('✅ Successfully scraped real case data!')
              return result
            }
          }
          
        } catch (error) {
          console.log(`❌ Error with ${courtUrl}:`, error.message)
          continue
        }
      }
      
      console.log('❌ Could not access any court system or find case data')
      return null
      
    } catch (error) {
      console.error('Error in real data scraping:', error)
      return null
    } finally {
      await page.close()
    }
  }

  private async findCaseSearchForm(page: any): Promise<boolean> {
    try {
      // Look for various case search form elements
      const selectors = [
        'input[name="caseNumber"]',
        'input[id*="case"]',
        'input[placeholder*="case"]',
        'input[type="text"]',
        'form input[type="text"]',
        'input[class*="case"]'
      ]
      
      for (const selector of selectors) {
        const element = await page.$(selector)
        if (element) {
          console.log(`✅ Found potential case input: ${selector}`)
          return true
        }
      }
      
      // Look for any form that might be for case search
      const forms = await page.$$('form')
      console.log(`Found ${forms.length} forms on page`)
      
      for (let i = 0; i < forms.length; i++) {
        const formText = await forms[i].evaluate((el: any) => el.textContent)
        if (formText && (formText.toLowerCase().includes('case') || formText.toLowerCase().includes('search'))) {
          console.log(`✅ Found potential search form: ${formText.substring(0, 100)}...`)
          return true
        }
      }
      
      return false
    } catch (error) {
      console.error('Error finding search form:', error)
      return false
    }
  }

  private async performCaseSearch(page: any, caseNumber: string): Promise<RealCaseData | null> {
    try {
      // Find and fill case number input
      const caseInput = await page.$('input[name="caseNumber"], input[id*="case"], input[placeholder*="case"], input[type="text"]')
      
      if (caseInput) {
        await caseInput.click()
        await caseInput.type(caseNumber, { delay: 100 })
        console.log(`✅ Entered case number: ${caseNumber}`)
        
        // Find and click search button
        const searchButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Search"), button:contains("Submit")')
        
        if (searchButton) {
          await searchButton.click()
          console.log('✅ Clicked search button')
          
          // Wait for results
          await page.waitForTimeout(5000)
          
          // Look for case results
          const caseData = await this.extractCaseData(page, caseNumber)
          return caseData
        }
      }
      
      return null
    } catch (error) {
      console.error('Error performing case search:', error)
      return null
    }
  }

  private async extractCaseData(page: any, caseNumber: string): Promise<RealCaseData | null> {
    try {
      // Look for case information in the results
      const caseInfo = await page.evaluate((caseNum: string) => {
        // Look for case number in results
        const caseNumberEl = document.querySelector(`*:contains("${caseNum}")`)
        if (!caseNumberEl) return null
        
        // Extract case details
        const titleEl = document.querySelector('h1, h2, h3, [class*="title"], [class*="name"]')
        const statusEl = document.querySelector('[class*="status"], [class*="state"]')
        const dateEls = document.querySelectorAll('[class*="date"], [class*="filed"], [class*="time"]')
        const partyEls = document.querySelectorAll('[class*="party"], [class*="plaintiff"], [class*="defendant"]')
        const judgeEl = document.querySelector('[class*="judge"], [class*="officer"]')
        const deptEl = document.querySelector('[class*="department"], [class*="division"]')
        
        return {
          caseNumber: caseNum,
          title: titleEl?.textContent?.trim() || '',
          status: statusEl?.textContent?.trim() || 'Active',
          dates: Array.from(dateEls).map(el => el.textContent?.trim()).filter(Boolean),
          parties: Array.from(partyEls).map(el => el.textContent?.trim()).filter(Boolean),
          judge: judgeEl?.textContent?.trim() || 'Unknown',
          department: deptEl?.textContent?.trim() || 'San Diego Superior Court'
        }
      }, caseNumber)
      
      if (caseInfo && caseInfo.title) {
        return {
          caseNumber: caseInfo.caseNumber,
          caseTitle: caseInfo.title,
          caseType: 'Family Law', // Default, could be enhanced
          status: caseInfo.status,
          dateFiled: caseInfo.dates[0] || new Date().toISOString().split('T')[0],
          lastActivity: caseInfo.dates[1] || new Date().toISOString().split('T')[0],
          department: caseInfo.department,
          judge: caseInfo.judge,
          parties: caseInfo.parties,
          upcomingEvents: [],
          registerOfActions: [],
          note: 'Real case data scraped from San Diego County court system'
        }
      }
      
      return null
    } catch (error) {
      console.error('Error extracting case data:', error)
      return null
    }
  }
}

// Singleton instance
export const realDataScraper = new RealDataScraper()
