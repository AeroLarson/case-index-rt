import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug San Diego County Case Search
 * This endpoint helps debug why searches aren't returning results
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.sdcourt.ca.gov'
    const searchTerm = 'test' // Simple test term
    const searchUrl = `${baseUrl}/search?search=${encodeURIComponent(searchTerm)}`
    
    console.log('Debugging San Diego County case search...')
    console.log('Search term:', searchTerm)
    console.log('Search URL:', searchUrl)
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': `${baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`,
      }
    })

    console.log('Response status:', response.status)
    console.log('Response URL:', response.url)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: searchUrl,
        finalUrl: response.url
      })
    }

    const html = await response.text()
    
    // Check if we got redirected or if there's an error page
    const isErrorPage = html.includes('error') || html.includes('Error') || html.includes('404') || html.includes('Not Found')
    const isSearchPage = html.includes('search') || html.includes('Search') || html.includes('case') || html.includes('Case')
    const hasResults = html.includes('result') || html.includes('Result') || html.includes('found') || html.includes('Found')
    
    // Look for any case-related content
    const caseNumberMatches = html.match(/(FL|CR|CV|SC|TR|JC|AD|AP|GU|MH|PR|SB|SS|ST|TR|WS)-\d{4}-\d{6}/gi) || []
    const hasCaseNumbers = caseNumberMatches.length > 0
    
    // Check for common search result indicators
    const hasTable = html.includes('<table')
    const hasList = html.includes('<ul') || html.includes('<ol')
    const hasDiv = html.includes('<div')
    
    // Look for "no results" messages
    const noResults = html.includes('No results') || html.includes('no results') || 
                     html.includes('No cases found') || html.includes('no cases found') ||
                     html.includes('No records found') || html.includes('no records found')

    return NextResponse.json({
      success: true,
      status: response.status,
      url: searchUrl,
      finalUrl: response.url,
      searchTerm,
      analysis: {
        isErrorPage,
        isSearchPage,
        hasResults,
        hasCaseNumbers,
        caseNumbersFound: caseNumberMatches.length,
        caseNumbers: caseNumberMatches.slice(0, 5),
        hasTable,
        hasList,
        hasDiv,
        noResults,
        htmlLength: html.length
      },
      htmlPreview: html.substring(0, 2000),
      message: 'Debug analysis of San Diego County search'
    })

  } catch (error) {
    console.error('County search debug error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to debug San Diego County search'
      },
      { status: 500 }
    )
  }
}
