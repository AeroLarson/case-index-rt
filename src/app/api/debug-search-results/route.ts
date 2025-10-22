import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug Search Results
 * This endpoint shows exactly what the San Diego County search returns
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'Smith'
    const searchUrl = `https://www.sdcourt.ca.gov/search?search=${encodeURIComponent(searchQuery)}`
    
    console.log('Debugging search results for:', searchQuery)
    console.log('URL:', searchUrl)
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: searchUrl
      })
    }

    const html = await response.text()
    
    // Analyze the HTML structure
    const analysis = {
      htmlLength: html.length,
      hasCaseNumbers: /[A-Z]{2}-\d{4}-\d{6}/.test(html),
      hasTables: html.includes('<table'),
      hasLists: html.includes('<ul') || html.includes('<ol'),
      hasDivs: html.includes('<div'),
      hasLinks: html.includes('<a'),
      hasForms: html.includes('<form'),
      hasButtons: html.includes('<button'),
      hasInputs: html.includes('<input'),
      hasSelects: html.includes('<select'),
      hasParagraphs: html.includes('<p'),
      hasHeaders: html.includes('<h1') || html.includes('<h2') || html.includes('<h3'),
      hasResults: html.includes('result') || html.includes('Result') || html.includes('found') || html.includes('Found'),
      hasNoResults: html.includes('No results') || html.includes('no results') || html.includes('No cases found') || html.includes('no cases found'),
      hasCaseContent: html.includes('case') || html.includes('Case') || html.includes('court') || html.includes('Court'),
      hasHearingContent: html.includes('hearing') || html.includes('Hearing') || html.includes('judge') || html.includes('Judge'),
      hasDateContent: html.includes('date') || html.includes('Date') || html.includes('filed') || html.includes('Filed')
    }
    
    // Extract case numbers
    const caseNumberRegex = /([A-Z]{2}-\d{4}-\d{6})/g
    const caseNumbers = []
    let caseMatch
    while ((caseMatch = caseNumberRegex.exec(html)) !== null) {
      caseNumbers.push(caseMatch[1])
    }
    
    // Extract any links that might be case-related
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
    const links = []
    let linkMatch
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1]
      const text = linkMatch[2].replace(/<[^>]*>/g, '').trim()
      if (href && text && (href.includes('case') || text.includes('case') || text.includes('court') || text.includes('Court'))) {
        links.push({ href, text: text.substring(0, 100) })
      }
    }
    
    // Extract any table content
    const tableRegex = /<table[^>]*>(.*?)<\/table>/gi
    const tables = []
    let tableMatch
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tableContent = tableMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      if (tableContent.length > 50) {
        tables.push(tableContent.substring(0, 200))
      }
    }
    
    // Extract any list content
    const listRegex = /<(ul|ol)[^>]*>(.*?)<\/(ul|ol)>/gi
    const lists = []
    let listMatch
    while ((listMatch = listRegex.exec(html)) !== null) {
      const listContent = listMatch[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      if (listContent.length > 50) {
        lists.push(listContent.substring(0, 200))
      }
    }

    return NextResponse.json({
      success: true,
      searchQuery,
      url: searchUrl,
      status: response.status,
      analysis,
      caseNumbers,
      links: links.slice(0, 10),
      tables: tables.slice(0, 5),
      lists: lists.slice(0, 5),
      htmlPreview: html.substring(0, 3000),
      message: 'Search results analysis completed'
    })

  } catch (error) {
    console.error('Debug search results error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Debug search results failed'
      },
      { status: 500 }
    )
  }
}
