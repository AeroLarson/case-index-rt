import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Working Search Methods
 * This endpoint tests actual working search methods step by step
 */
export async function GET(request: NextRequest) {
  const results = {
    tests: [],
    workingMethods: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  }

  // Test 1: Try the public case search with a simple query
  try {
    console.log('Test 1: Public case search with simple query...')
    const searchUrl = 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch'
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    const html = await response.text()
    const hasSearchForm = html.includes('search') || html.includes('form') || html.includes('input')
    
    results.tests.push({
      name: 'Public Case Search Page',
      url: searchUrl,
      status: response.status,
      success: response.ok,
      hasSearchForm,
      htmlLength: html.length,
      message: response.ok ? 'Success - Page accessible' : `Failed: ${response.status}`
    })
    
    if (response.ok && hasSearchForm) {
      results.workingMethods.push('Public case search page accessible')
      results.summary.passed++
    } else {
      results.summary.failed++
    }
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'Public Case Search Page',
      url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 2: Try searching with a common name
  try {
    console.log('Test 2: Search with common name...')
    const searchUrl = 'https://www.sdcourt.ca.gov/search?search=Smith'
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    const html = await response.text()
    const hasResults = html.includes('case') || html.includes('result') || html.includes('found')
    const hasCaseNumbers = /[A-Z]{2}-\d{4}-\d{6}/.test(html)
    
    results.tests.push({
      name: 'Search with Common Name',
      url: searchUrl,
      status: response.status,
      success: response.ok,
      hasResults,
      hasCaseNumbers,
      htmlLength: html.length,
      message: response.ok ? 'Success - Search executed' : `Failed: ${response.status}`
    })
    
    if (response.ok) {
      results.workingMethods.push('General search with name works')
      results.summary.passed++
    } else {
      results.summary.failed++
    }
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'Search with Common Name',
      url: 'https://www.sdcourt.ca.gov/search?search=Smith',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 3: Try searching with a case number format
  try {
    console.log('Test 3: Search with case number format...')
    const searchUrl = 'https://www.sdcourt.ca.gov/search?search=FL-2024-123456'
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })
    
    const html = await response.text()
    const hasResults = html.includes('case') || html.includes('result') || html.includes('found')
    
    results.tests.push({
      name: 'Search with Case Number',
      url: searchUrl,
      status: response.status,
      success: response.ok,
      hasResults,
      htmlLength: html.length,
      message: response.ok ? 'Success - Case number search executed' : `Failed: ${response.status}`
    })
    
    if (response.ok) {
      results.workingMethods.push('Case number search works')
      results.summary.passed++
    } else {
      results.summary.failed++
    }
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'Search with Case Number',
      url: 'https://www.sdcourt.ca.gov/search?search=FL-2024-123456',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 4: Try alternative search endpoints
  try {
    console.log('Test 4: Alternative search endpoints...')
    const alternativeUrls = [
      'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?search=Smith',
      'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=Smith',
      'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=FL-2024-123456'
    ]
    
    for (const url of alternativeUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          }
        })
        
        if (response.ok) {
          const html = await response.text()
          const hasResults = html.includes('case') || html.includes('result') || html.includes('found')
          
          results.tests.push({
            name: 'Alternative Search',
            url: url,
            status: response.status,
            success: true,
            hasResults,
            htmlLength: html.length,
            message: 'Success - Alternative search works'
          })
          
          results.workingMethods.push(`Alternative search works: ${url}`)
          results.summary.passed++
          results.summary.total++
          break // Found a working method
        }
      } catch (error) {
        // Continue to next URL
      }
    }
    
  } catch (error) {
    results.tests.push({
      name: 'Alternative Search',
      url: 'Multiple URLs tested',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  return NextResponse.json({
    success: true,
    results,
    workingMethods: results.workingMethods,
    summary: results.summary,
    message: `Found ${results.workingMethods.length} working methods out of ${results.summary.total} tests`
  })
}
