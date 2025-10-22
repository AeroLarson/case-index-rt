import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Real County Search
 * This endpoint tests with a real case to ensure we get actual data
 */
export async function GET(request: NextRequest) {
  try {
    // Use a real case number that we know exists
    const searchQuery = '22FL001581C' // Your real case number
    console.log('🔍 Testing real county search for:', searchQuery)
    
    // Step 1: Get the search form
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
        step: 'form_fetch'
      })
    }

    const formHtml = await formResponse.text()
    console.log('✅ Form HTML length:', formHtml.length)
    
    // Step 2: Extract form details
    const formActionMatch = formHtml.match(/<form[^>]*action="([^"]*)"[^>]*>/i)
    const formMethodMatch = formHtml.match(/<form[^>]*method="([^"]*)"[^>]*>/i)
    const formAction = formActionMatch ? formActionMatch[1] : '/sdcourt/generalinformation/courtrecords2/onlinecasesearch'
    const formMethod = formMethodMatch ? formMethodMatch[1] : 'POST'
    
    console.log('Form action:', formAction)
    console.log('Form method:', formMethod)
    
    // Step 3: Extract hidden fields
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
    
    // Step 4: Try different search approaches
    const searchApproaches = [
      // Approach 1: POST with caseNumber field
      {
        name: 'POST with caseNumber field',
        method: 'POST',
        url: `https://www.sdcourt.ca.gov${formAction}`,
        body: new URLSearchParams({
          caseNumber: searchQuery,
          ...Object.fromEntries(hiddenFields.map(f => [f.name, f.value]))
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': formUrl,
          'Origin': 'https://www.sdcourt.ca.gov',
        }
      },
      // Approach 2: POST with search field
      {
        name: 'POST with search field',
        method: 'POST',
        url: `https://www.sdcourt.ca.gov${formAction}`,
        body: new URLSearchParams({
          search: searchQuery,
          ...Object.fromEntries(hiddenFields.map(f => [f.name, f.value]))
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Referer': formUrl,
          'Origin': 'https://www.sdcourt.ca.gov',
        }
      },
      // Approach 3: GET with caseNumber parameter
      {
        name: 'GET with caseNumber parameter',
        method: 'GET',
        url: `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=${encodeURIComponent(searchQuery)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      },
      // Approach 4: Try alternative search endpoint
      {
        name: 'Alternative search endpoint',
        method: 'GET',
        url: `https://courtindex.sdcourt.ca.gov/CISPublic/enter?caseNumber=${encodeURIComponent(searchQuery)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        }
      }
    ]
    
    const results = []
    
    for (const approach of searchApproaches) {
      try {
        console.log(`🔍 Trying ${approach.name}...`)
        
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
          hasCaseNumbers: false,
          caseNumbers: [],
          hasCaseContent: false,
          hasTables: false,
          hasResults: false,
          hasNoResults: false,
          caseInfo: {},
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
          const caseNumberPatterns = [
            /(\d{2}[A-Z]{2}\d{6}[A-Z]?)/g,  // Format like 22FL001581C
            /([A-Z]{2}-\d{4}-\d{6})/g,      // Standard format FL-2024-123456
          ]
          
          const allCaseNumbers = []
          for (const pattern of caseNumberPatterns) {
            const matches = html.match(pattern)
            if (matches) {
              allCaseNumbers.push(...matches)
            }
          }
          
          result.caseNumbers = [...new Set(allCaseNumbers)]
          result.hasCaseNumbers = result.caseNumbers.length > 0
          
          // Extract case information
          const caseInfoPatterns = [
            /Case Number[:\s]*([^<\n]+)/i,
            /Case Title[:\s]*([^<\n]+)/i,
            /Case Type[:\s]*([^<\n]+)/i,
            /Case Status[:\s]*([^<\n]+)/i,
            /Date Filed[:\s]*([^<\n]+)/i,
            /Department[:\s]*([^<\n]+)/i,
            /Judicial Officer[:\s]*([^<\n]+)/i,
            /Petitioner[:\s]*([^<\n]+)/i,
            /Respondent[:\s]*([^<\n]+)/i
          ]
          
          for (const pattern of caseInfoPatterns) {
            const match = html.match(pattern)
            if (match && match[1]) {
              const key = pattern.source.split('[')[0].replace(/[^a-zA-Z]/g, '').toLowerCase()
              result.caseInfo[key] = match[1].trim()
            }
          }
          
          console.log(`✅ ${approach.name}: ${result.htmlLength} chars, ${result.caseNumbers.length} case numbers`)
          if (result.caseNumbers.length > 0) {
            console.log('🎯 Found case numbers:', result.caseNumbers)
          }
          if (Object.keys(result.caseInfo).length > 0) {
            console.log('🎯 Found case info:', result.caseInfo)
          }
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
          hasCaseNumbers: false,
          caseNumbers: [],
          hasCaseContent: false,
          hasTables: false,
          hasResults: false,
          hasNoResults: false,
          caseInfo: {},
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    const successfulResults = results.filter(r => r.success)
    const resultsWithCaseNumbers = results.filter(r => r.hasCaseNumbers)
    const bestResult = resultsWithCaseNumbers[0] || successfulResults[0]
    
    return NextResponse.json({
      success: true,
      searchQuery,
      results,
      summary: {
        totalApproaches: results.length,
        successfulApproaches: successfulResults.length,
        approachesWithCaseNumbers: resultsWithCaseNumbers.length,
        bestApproach: bestResult?.name || 'None'
      },
      bestResult: bestResult ? {
        name: bestResult.name,
        caseNumbers: bestResult.caseNumbers,
        caseInfo: bestResult.caseInfo,
        htmlLength: bestResult.htmlLength
      } : null,
      message: 'Real county search test completed'
    })
    
  } catch (error) {
    console.error('Real county search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Real county search test failed'
      },
      { status: 500 }
    )
  }
}
