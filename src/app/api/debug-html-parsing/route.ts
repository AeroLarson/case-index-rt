import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug HTML Parsing
 * This endpoint analyzes the actual HTML from working search methods
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'Smith'
    console.log('Debugging HTML parsing for:', searchQuery)
    
    // Use the working search method
    const searchUrl = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?search=${encodeURIComponent(searchQuery)}`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch',
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
    
    // Analyze the HTML structure in detail
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
      hasDateContent: html.includes('date') || html.includes('Date') || html.includes('filed') || html.includes('Filed'),
      hasSearchForm: html.includes('search') || html.includes('Search'),
      hasSubmitButton: html.includes('submit') || html.includes('Submit'),
      hasJavaScript: html.includes('<script'),
      hasCSS: html.includes('<style') || html.includes('css'),
      hasMeta: html.includes('<meta'),
      hasTitle: html.includes('<title')
    }
    
    // Extract case numbers with different patterns
    const caseNumberPatterns = [
      /([A-Z]{2}-\d{4}-\d{6})/g,  // Standard format
      /([A-Z]{2}-\d{4}-\d{5})/g,  // 5-digit format
      /([A-Z]{2}-\d{4}-\d{7})/g,  // 7-digit format
      /([A-Z]{2}-\d{4}-\d{4})/g,  // 4-digit format
      /([A-Z]{2}-\d{4}-\d{8})/g,  // 8-digit format
      /([A-Z]{2}-\d{4}-\d{3})/g,  // 3-digit format
      /([A-Z]{2}-\d{4}-\d{9})/g,  // 9-digit format
      /([A-Z]{2}-\d{4}-\d{2})/g,  // 2-digit format
      /([A-Z]{2}-\d{4}-\d{10})/g, // 10-digit format
      /([A-Z]{2}-\d{4}-\d{1})/g,  // 1-digit format
    ]
    
    const allCaseNumbers = []
    for (const pattern of caseNumberPatterns) {
      const matches = html.match(pattern)
      if (matches) {
        allCaseNumbers.push(...matches)
      }
    }
    
    // Remove duplicates
    const uniqueCaseNumbers = [...new Set(allCaseNumbers)]
    
    // Extract any links that might be case-related
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
    const links = []
    let linkMatch
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1]
      const text = linkMatch[2].replace(/<[^>]*>/g, '').trim()
      if (href && text && (href.includes('case') || text.includes('case') || text.includes('court') || text.includes('Court') || text.includes('search') || text.includes('Search'))) {
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
    
    // Look for any text that might contain case information
    const caseInfoRegex = /(case|Case|court|Court|hearing|Hearing|judge|Judge|filed|Filed|date|Date|party|Party|attorney|Attorney)/g
    const caseInfoMatches = html.match(caseInfoRegex)
    
    // Extract any numbers that might be case-related
    const numberRegex = /\d{4}-\d{6}|\d{4}-\d{5}|\d{4}-\d{7}|\d{4}-\d{4}|\d{4}-\d{8}|\d{4}-\d{3}|\d{4}-\d{9}|\d{4}-\d{2}|\d{4}-\d{10}|\d{4}-\d{1}/g
    const numbers = html.match(numberRegex) || []
    
    // Look for any text that might indicate search results
    const searchResultRegex = /(result|Result|found|Found|match|Match|case|Case|court|Court)/g
    const searchResultMatches = html.match(searchResultRegex)
    
    return NextResponse.json({
      success: true,
      searchQuery,
      url: searchUrl,
      status: response.status,
      analysis,
      uniqueCaseNumbers,
      allCaseNumbers,
      links: links.slice(0, 10),
      tables: tables.slice(0, 5),
      lists: lists.slice(0, 5),
      caseInfoMatches: caseInfoMatches ? caseInfoMatches.slice(0, 20) : [],
      numbers: numbers.slice(0, 20),
      searchResultMatches: searchResultMatches ? searchResultMatches.slice(0, 20) : [],
      htmlPreview: html.substring(0, 5000),
      message: 'HTML parsing analysis completed'
    })

  } catch (error) {
    console.error('HTML parsing debug error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'HTML parsing debug failed'
      },
      { status: 500 }
    )
  }
}
