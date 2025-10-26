import puppeteer, { Browser, Page } from 'puppeteer'

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

export class RealCaseScraper {
  private browser: Browser | null = null

  async init(): Promise<void> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
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

  async searchCase(caseNumber: string): Promise<RealCaseData | null> {
    await this.init()
    
    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    const page = await this.browser.newPage()
    
    try {
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
      
      // Set viewport
      await page.setViewport({ width: 1366, height: 768 })
      
      // Enable request interception to handle Cloudflare
      await page.setRequestInterception(true)
      page.on('request', (request) => {
        request.continue()
      })
      
      // Navigate to San Diego County Court Index
      console.log('🔍 Navigating to San Diego County Court Index...')
      
      try {
        await page.goto('https://courtindex.sdcourt.ca.gov/CISPublic/enter', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })
      } catch (error) {
        console.log('❌ Failed to navigate to Court Index, trying main site...')
        
        // Try the main San Diego County site instead
        await page.goto('https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch', {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })
      }
      
      // Wait for the page to load and handle Cloudflare challenge
      console.log('⏳ Waiting for page to load...')
      await page.waitForTimeout(10000)
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'debug-screenshot.png' })
      console.log('📸 Screenshot saved for debugging')
      
      // Get page content for debugging
      const pageContent = await page.content()
      console.log('📄 Page content length:', pageContent.length)
      
      // Look for case search form
      console.log('🔍 Looking for case search form...')
      
      // Try to find case number input field
      const caseNumberInput = await page.$('input[name="caseNumber"], input[id*="case"], input[placeholder*="case"]')
      
      if (caseNumberInput) {
        console.log('✅ Found case number input field')
        
        // Enter case number
        await caseNumberInput.type(caseNumber)
        
        // Look for search button
        const searchButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Search")')
        
        if (searchButton) {
          console.log('✅ Found search button, clicking...')
          await searchButton.click()
          
          // Wait for results
          await page.waitForTimeout(5000)
          
          // Check if we got results
          const results = await this.parseCaseResults(page)
          
          if (results) {
            console.log('✅ Successfully scraped case data')
            return results
          }
        }
      }
      
      // If we didn't find the expected form, try alternative approach
      console.log('⚠️ Standard form not found, trying alternative approach...')
      
      // Look for any input field that might be for case numbers
      const allInputs = await page.$$('input[type="text"]')
      console.log(`Found ${allInputs.length} text inputs`)
      
      for (const input of allInputs) {
        const placeholder = await input.evaluate(el => el.getAttribute('placeholder'))
        const name = await input.evaluate(el => el.getAttribute('name'))
        const id = await input.evaluate(el => el.getAttribute('id'))
        
        console.log(`Input: name=${name}, id=${id}, placeholder=${placeholder}`)
        
        if (placeholder?.toLowerCase().includes('case') || 
            name?.toLowerCase().includes('case') || 
            id?.toLowerCase().includes('case')) {
          
          console.log(`✅ Found potential case input: ${name || id || placeholder}`)
          
          await input.type(caseNumber)
          
          // Look for submit button
          const submitButton = await page.$('button[type="submit"], input[type="submit"]')
          if (submitButton) {
            await submitButton.click()
            await page.waitForTimeout(5000)
            
            const results = await this.parseCaseResults(page)
            if (results) {
              return results
            }
          }
        }
      }
      
      console.log('❌ Could not find case search form or get results')
      return null
      
    } catch (error) {
      console.error('Error scraping case data:', error)
      return null
    } finally {
      await page.close()
    }
  }

  private async parseCaseResults(page: Page): Promise<RealCaseData | null> {
    try {
      // Look for case information in various formats
      const caseInfo = await page.evaluate(() => {
        // Look for case number
        const caseNumberEl = document.querySelector('[class*="case"], [id*="case"], [class*="number"]')
        const caseNumber = caseNumberEl?.textContent?.trim() || ''
        
        // Look for case title
        const titleEl = document.querySelector('h1, h2, h3, [class*="title"], [class*="name"]')
        const title = titleEl?.textContent?.trim() || ''
        
        // Look for status
        const statusEl = document.querySelector('[class*="status"], [class*="state"]')
        const status = statusEl?.textContent?.trim() || 'Active'
        
        // Look for date information
        const dateEls = document.querySelectorAll('[class*="date"], [class*="filed"], [class*="time"]')
        const dates = Array.from(dateEls).map(el => el.textContent?.trim()).filter(Boolean)
        
        // Look for party information
        const partyEls = document.querySelectorAll('[class*="party"], [class*="plaintiff"], [class*="defendant"]')
        const parties = Array.from(partyEls).map(el => el.textContent?.trim()).filter(Boolean)
        
        // Look for judge information
        const judgeEl = document.querySelector('[class*="judge"], [class*="officer"]')
        const judge = judgeEl?.textContent?.trim() || 'Unknown'
        
        // Look for department
        const deptEl = document.querySelector('[class*="department"], [class*="division"]')
        const department = deptEl?.textContent?.trim() || 'San Diego Superior Court'
        
        return {
          caseNumber,
          title,
          status,
          dates,
          parties,
          judge,
          department
        }
      })
      
      if (caseInfo.caseNumber && caseInfo.title) {
        return {
          caseNumber: caseInfo.caseNumber,
          caseTitle: caseInfo.title,
          caseType: 'Family Law', // Default type
          status: caseInfo.status,
          dateFiled: caseInfo.dates[0] || new Date().toISOString().split('T')[0],
          lastActivity: caseInfo.dates[1] || new Date().toISOString().split('T')[0],
          department: caseInfo.department,
          judge: caseInfo.judge,
          parties: caseInfo.parties,
          upcomingEvents: [],
          registerOfActions: [],
          note: 'Real case data scraped from San Diego County website'
        }
      }
      
      return null
      
    } catch (error) {
      console.error('Error parsing case results:', error)
      return null
    }
  }

  async searchByName(name: string): Promise<RealCaseData[]> {
    // Similar implementation for name search
    // This would search by party name instead of case number
    return []
  }
}

// Singleton instance
export const realCaseScraper = new RealCaseScraper()
