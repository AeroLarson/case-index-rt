import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Real San Diego County Case Search
 * This endpoint tests actual case searching with the county system
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.sdcourt.ca.gov'
    const searchTerm = 'Smith' // Test search term
    const searchUrl = `${baseUrl}/search?search=${encodeURIComponent(searchTerm)}`
    
    console.log('Testing real San Diego County case search...')
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
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: searchUrl
      })
    }

    const html = await response.text()
    
    // Look for case results in the HTML
    const caseResults = [];
    
    // Look for case numbers (common patterns: FL-2024-XXXXXX, CR-2024-XXXXXX, etc.)
    const caseNumberRegex = /(FL|CR|CV|SC|TR|JC|AD|AP|GU|MH|PR|SB|SS|ST|TR|WS)-\d{4}-\d{6}/gi;
    const caseNumbers = [];
    let caseMatch;
    
    while ((caseMatch = caseNumberRegex.exec(html)) !== null) {
      caseNumbers.push(caseMatch[0]);
    }
    
    // Look for case titles or party names
    const titleRegex = /<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi;
    const titles = [];
    let titleMatch;
    
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      if (title && title.length > 5 && title.length < 200) {
        titles.push(title);
      }
    }
    
    // Look for table rows that might contain case data
    const tableRowRegex = /<tr[^>]*>(.*?)<\/tr>/gi;
    const tableRows = [];
    let rowMatch;
    
    while ((rowMatch = tableRowRegex.exec(html)) !== null) {
      const rowHtml = rowMatch[1];
      const cellRegex = /<td[^>]*>(.*?)<\/td>/gi;
      const cells = [];
      let cellMatch;
      
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim();
        if (cellText && cellText.length > 0) {
          cells.push(cellText);
        }
      }
      
      if (cells.length >= 2) {
        tableRows.push({
          cells: cells,
          rowHtml: rowHtml.substring(0, 200)
        });
      }
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      url: searchUrl,
      searchTerm,
      analysis: {
        caseNumbersFound: caseNumbers.length,
        caseNumbers: caseNumbers.slice(0, 10), // First 10 case numbers
        titlesFound: titles.length,
        titles: titles.slice(0, 10), // First 10 titles
        tableRowsFound: tableRows.length,
        tableRows: tableRows.slice(0, 5) // First 5 table rows
      },
      htmlPreview: html.substring(0, 3000),
      message: 'Successfully tested San Diego County case search'
    })

  } catch (error) {
    console.error('County real search test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test San Diego County case search'
      },
      { status: 500 }
    )
  }
}
