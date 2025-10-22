import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Form Submission
 * This endpoint tests proper form submission to get actual search results
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'tonya larson'
    console.log('Testing form submission for:', searchQuery)
    
    // First, get the search form to extract any required fields
    const formUrl = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch`
    
    const formResponse = await fetch(formUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!formResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Form fetch error: ${formResponse.status}`,
        url: formUrl
      })
    }

    const formHtml = await formResponse.text()
    console.log('Form HTML length:', formHtml.length)
    
    // Extract form action and method
    const formActionMatch = formHtml.match(/<form[^>]*action="([^"]*)"[^>]*>/i)
    const formMethodMatch = formHtml.match(/<form[^>]*method="([^"]*)"[^>]*>/i)
    const formAction = formActionMatch ? formActionMatch[1] : '/sdcourt/generalinformation/courtrecords2/onlinecasesearch'
    const formMethod = formMethodMatch ? formMethodMatch[1] : 'POST'
    
    console.log('Form action:', formAction)
    console.log('Form method:', formMethod)
    
    // Extract any hidden fields or tokens
    const hiddenFields = []
    const hiddenFieldRegex = /<input[^>]*type="hidden"[^>]*name="([^"]*)"[^>]*value="([^"]*)"[^>]*>/gi
    let hiddenMatch
    while ((hiddenMatch = hiddenFieldRegex.exec(formHtml)) !== null) {
      hiddenFields.push({
        name: hiddenMatch[1],
        value: hiddenMatch[2]
      })
    }
    
    console.log('Hidden fields found:', hiddenFields.length)
    
    // Try different search approaches
    const searchApproaches = [
      // Approach 1: POST to the form action
      {
        name: 'POST Form Submission',
        url: `https://www.sdcourt.ca.gov${formAction}`,
        method: 'POST',
        body: new URLSearchParams({
          search: searchQuery,
          ...Object.fromEntries(hiddenFields.map(f => [f.name, f.value]))
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': formUrl,
        }
      },
      // Approach 2: GET with different parameters
      {
        name: 'GET with partyName parameter',
        url: `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      },
      // Approach 3: GET with caseNumber parameter
      {
        name: 'GET with caseNumber parameter',
        url: `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      },
      // Approach 4: Try the alternative search endpoint
      {
        name: 'Alternative Search Endpoint',
        url: `https://courtindex.sdcourt.ca.gov/CISPublic/enter?search=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      }
    ]
    
    const results = []
    
    for (const approach of searchApproaches) {
      try {
        console.log(`Trying ${approach.name}: ${approach.url}`)
        
        const response = await fetch(approach.url, {
          method: approach.method,
          headers: approach.headers,
          body: approach.body,
          timeout: 15000
        })
        
        const result = {
          name: approach.name,
          url: approach.url,
          method: approach.method,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          htmlLength: 0,
          hasCaseContent: false,
          hasCaseNumbers: false,
          caseNumbers: [],
          hasTables: false,
          hasResults: false,
          hasNoResults: false,
          error: null
        }
        
        if (response.ok) {
          const html = await response.text()
          result.htmlLength = html.length
          result.hasCaseContent = html.includes('case') || html.includes('Case') || html.includes('court') || html.includes('Court')
          result.hasTables = html.includes('<table')
          result.hasResults = html.includes('result') || html.includes('Result') || html.includes('found') || html.includes('Found')
          result.hasNoResults = html.includes('No results') || html.includes('no results') || html.includes('No cases found') || html.includes('no cases found')
          
          // Look for case numbers
          const caseNumberRegex = /([A-Z]{2}-\d{4}-\d{6})/g
          const caseNumbers = []
          let caseMatch
          while ((caseMatch = caseNumberRegex.exec(html)) !== null) {
            caseNumbers.push(caseMatch[1])
          }
          result.caseNumbers = caseNumbers
          result.hasCaseNumbers = caseNumbers.length > 0
          
          console.log(`✅ ${approach.name} successful: ${result.htmlLength} chars, ${caseNumbers.length} case numbers`)
        } else {
          result.error = `HTTP ${response.status}: ${response.statusText}`
          console.log(`❌ ${approach.name} failed: ${result.error}`)
        }
        
        results.push(result)
        
      } catch (error) {
        console.log(`❌ ${approach.name} error:`, error)
        results.push({
          name: approach.name,
          url: approach.url,
          method: approach.method,
          status: 0,
          statusText: 'Error',
          success: false,
          htmlLength: 0,
          hasCaseContent: false,
          hasCaseNumbers: false,
          caseNumbers: [],
          hasTables: false,
          hasResults: false,
          hasNoResults: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const successfulResults = results.filter(r => r.success)
    const totalCaseNumbers = results.reduce((sum, r) => sum + r.caseNumbers.length, 0)
    const bestResult = successfulResults.find(r => r.hasCaseNumbers) || successfulResults.find(r => r.hasTables) || successfulResults[0]
    
    return NextResponse.json({
      success: true,
      searchQuery,
      formAction,
      formMethod,
      hiddenFields,
      results,
      summary: {
        totalApproaches: results.length,
        successfulApproaches: successfulResults.length,
        totalCaseNumbers,
        bestApproach: bestResult?.name || 'None'
      },
      message: 'Form submission test completed'
    })
    
  } catch (error) {
    console.error('Form submission test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Form submission test failed'
      },
      { status: 500 }
    )
  }
}
