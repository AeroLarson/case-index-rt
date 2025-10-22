import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Robust Search
 * This endpoint tests the improved search system with multiple fallback methods
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'Smith'
    console.log('Testing robust search for:', searchQuery)
    
    // Test multiple search endpoints
    const searchEndpoints = [
      {
        name: 'Direct Search',
        url: `https://www.sdcourt.ca.gov/search?search=${encodeURIComponent(searchQuery)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      },
      {
        name: 'Alternative Search',
        url: `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?search=${encodeURIComponent(searchQuery)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch',
        }
      },
      {
        name: 'Party Name Search',
        url: `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=${encodeURIComponent(searchQuery)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      }
    ]
    
    const results = []
    
    for (const endpoint of searchEndpoints) {
      try {
        console.log(`Testing ${endpoint.name}: ${endpoint.url}`)
        
        const response = await fetch(endpoint.url, {
          headers: endpoint.headers,
          timeout: 15000
        })
        
        const result = {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          htmlLength: 0,
          hasCaseContent: false,
          hasCaseNumbers: false,
          caseNumbers: [],
          error: null
        }
        
        if (response.ok) {
          const html = await response.text()
          result.htmlLength = html.length
          result.hasCaseContent = html.includes('case') || html.includes('Case') || html.includes('court') || html.includes('Court')
          
          // Look for case numbers
          const caseNumberRegex = /([A-Z]{2}-\d{4}-\d{6})/g
          const caseNumbers = []
          let caseMatch
          while ((caseMatch = caseNumberRegex.exec(html)) !== null) {
            caseNumbers.push(caseMatch[1])
          }
          result.caseNumbers = caseNumbers
          result.hasCaseNumbers = caseNumbers.length > 0
          
          console.log(`✅ ${endpoint.name} successful: ${result.htmlLength} chars, ${caseNumbers.length} case numbers`)
        } else {
          result.error = `HTTP ${response.status}: ${response.statusText}`
          console.log(`❌ ${endpoint.name} failed: ${result.error}`)
        }
        
        results.push(result)
        
      } catch (error) {
        console.log(`❌ ${endpoint.name} error:`, error)
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          statusText: 'Error',
          success: false,
          htmlLength: 0,
          hasCaseContent: false,
          hasCaseNumbers: false,
          caseNumbers: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const successfulResults = results.filter(r => r.success)
    const totalCaseNumbers = results.reduce((sum, r) => sum + r.caseNumbers.length, 0)
    
    return NextResponse.json({
      success: true,
      searchQuery,
      results,
      summary: {
        totalEndpoints: results.length,
        successfulEndpoints: successfulResults.length,
        totalCaseNumbers,
        bestMethod: successfulResults.find(r => r.hasCaseNumbers)?.name || 'None'
      },
      message: 'Robust search test completed'
    })
    
  } catch (error) {
    console.error('Robust search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Robust search test failed'
      },
      { status: 500 }
    )
  }
}
