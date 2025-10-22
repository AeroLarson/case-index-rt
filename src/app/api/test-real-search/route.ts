import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Real Case Search
 * This endpoint actually tries to search for cases and extract data
 */
export async function GET(request: NextRequest) {
  try {
    console.log('Testing real case search...')
    
    // Test with a very common name that should return results
    const searchQuery = 'Smith'
    const searchUrl = `https://www.sdcourt.ca.gov/search?search=${encodeURIComponent(searchQuery)}`
    
    console.log('Searching for:', searchQuery)
    console.log('URL:', searchUrl)
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    console.log('Response status:', response.status)
    console.log('Response URL:', response.url)

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: searchUrl,
        finalUrl: response.url
      })
    }

    const html = await response.text()
    console.log('HTML length:', html.length)
    
    // Look for case numbers in the HTML
    const caseNumberRegex = /([A-Z]{2}-\d{4}-\d{6})/g
    const caseNumbers = []
    let caseMatch
    while ((caseMatch = caseNumberRegex.exec(html)) !== null) {
      caseNumbers.push(caseMatch[1])
    }
    
    // Look for case-related content
    const hasCaseContent = html.includes('case') || html.includes('Case') || html.includes('court') || html.includes('Court')
    const hasResults = html.includes('result') || html.includes('Result') || html.includes('found') || html.includes('Found')
    const hasTable = html.includes('<table')
    const hasList = html.includes('<ul') || html.includes('<ol')
    
    // Look for any links that might be case-related
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
    const caseLinks = []
    let linkMatch
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1]
      const text = linkMatch[2].replace(/<[^>]*>/g, '').trim()
      if (href && text && (href.includes('case') || text.includes('case') || text.includes('court'))) {
        caseLinks.push({ href, text: text.substring(0, 100) })
      }
    }

    return NextResponse.json({
      success: true,
      searchQuery,
      url: searchUrl,
      finalUrl: response.url,
      status: response.status,
      analysis: {
        htmlLength: html.length,
        caseNumbersFound: caseNumbers.length,
        caseNumbers: caseNumbers.slice(0, 10),
        hasCaseContent,
        hasResults,
        hasTable,
        hasList,
        caseLinks: caseLinks.slice(0, 5)
      },
      htmlPreview: html.substring(0, 2000),
      message: 'Real search test completed'
    })

  } catch (error) {
    console.error('Real search test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Real search test failed'
      },
      { status: 500 }
    )
  }
}
