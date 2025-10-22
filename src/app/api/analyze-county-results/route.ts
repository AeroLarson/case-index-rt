import { NextRequest, NextResponse } from 'next/server'

/**
 * Analyze San Diego County Search Results
 * This endpoint analyzes the actual search results to understand the format
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.sdcourt.ca.gov'
    const searchTerm = 'test'
    const searchUrl = `${baseUrl}/search?search=${encodeURIComponent(searchTerm)}`
    
    console.log('Analyzing San Diego County search results...')
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': `${baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`,
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Look for different types of content that might contain case information
    const analysis = {
      // Look for any text that might be case-related
      caseRelatedText: [],
      // Look for links that might be to case details
      caseLinks: [],
      // Look for any structured data
      structuredData: [],
      // Look for specific patterns
      patterns: {}
    }
    
    // Look for any text that contains case-like patterns
    const textMatches = html.match(/[A-Z]{2}-\d{4}-\d{6}/g) || []
    analysis.caseRelatedText = textMatches.slice(0, 10)
    
    // Look for links that might be case-related
    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi
    const links = []
    let linkMatch
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const href = linkMatch[1]
      const text = linkMatch[2].replace(/<[^>]*>/g, '').trim()
      if (href && text && (href.includes('case') || href.includes('court') || text.includes('case'))) {
        links.push({ href, text: text.substring(0, 100) })
      }
    }
    analysis.caseLinks = links.slice(0, 10)
    
    // Look for any divs or sections that might contain results
    const divRegex = /<div[^>]*class="[^"]*result[^"]*"[^>]*>(.*?)<\/div>/gi
    const resultDivs = []
    let divMatch
    while ((divMatch = divRegex.exec(html)) !== null) {
      resultDivs.push(divMatch[1].substring(0, 200))
    }
    analysis.structuredData = resultDivs.slice(0, 5)
    
    // Look for specific patterns
    analysis.patterns = {
      hasSearchResults: html.includes('search results') || html.includes('Search Results'),
      hasNoResults: html.includes('no results') || html.includes('No results'),
      hasCaseInfo: html.includes('case') || html.includes('Case'),
      hasCourtInfo: html.includes('court') || html.includes('Court'),
      hasPartyInfo: html.includes('party') || html.includes('Party'),
      hasJudgeInfo: html.includes('judge') || html.includes('Judge'),
      hasDateInfo: html.includes('date') || html.includes('Date'),
      hasStatusInfo: html.includes('status') || html.includes('Status')
    }
    
    // Look for any lists that might contain results
    const listRegex = /<ul[^>]*>(.*?)<\/ul>/gi
    const lists = []
    let listMatch
    while ((listMatch = listRegex.exec(html)) !== null) {
      const listContent = listMatch[1].replace(/<[^>]*>/g, '').trim()
      if (listContent.length > 20) {
        lists.push(listContent.substring(0, 200))
      }
    }
    
    // Look for any paragraphs that might contain case information
    const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi
    const paragraphs = []
    let paraMatch
    while ((paraMatch = paragraphRegex.exec(html)) !== null) {
      const paraContent = paraMatch[1].replace(/<[^>]*>/g, '').trim()
      if (paraContent.length > 20 && (paraContent.includes('case') || paraContent.includes('court'))) {
        paragraphs.push(paraContent.substring(0, 200))
      }
    }

    return NextResponse.json({
      success: true,
      url: searchUrl,
      searchTerm,
      analysis: {
        ...analysis,
        lists: lists.slice(0, 5),
        paragraphs: paragraphs.slice(0, 5),
        htmlLength: html.length
      },
      htmlPreview: html.substring(0, 3000),
      message: 'Analysis of San Diego County search results structure'
    })

  } catch (error) {
    console.error('County results analysis error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze San Diego County search results'
      },
      { status: 500 }
    )
  }
}
