import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Real Case Search
 * This endpoint will test searching for a real case and show us exactly what we get
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = '22FL001581C'
    console.log('🔍 Testing real case search for:', searchQuery)
    
    // Test the main San Diego County search directly
    const searchUrl = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=${encodeURIComponent(searchQuery)}`
    console.log('Search URL:', searchUrl)
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'X-Forwarded-For': '3.224.164.255',
        'X-Real-IP': '3.224.164.255',
      }
    });

    if (!searchResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${searchResponse.status}`,
        url: searchUrl
      })
    }

    const searchHtml = await searchResponse.text();
    console.log('HTML length:', searchHtml.length)
    
    // Analyze the HTML content
    const analysis = {
      htmlLength: searchHtml.length,
      hasSearchForm: searchHtml.includes('search') && searchHtml.includes('form'),
      hasCaseData: searchHtml.includes('Case Title') || searchHtml.includes('case results'),
      hasCaseNumbers: /[A-Z]{2}-\d{4}-\d{6}/.test(searchHtml),
      hasPartyNames: searchHtml.includes('Plaintiff') || searchHtml.includes('Defendant'),
      hasJudgeInfo: searchHtml.includes('Judge') || searchHtml.includes('Hon'),
      hasStatusInfo: searchHtml.includes('Status') || searchHtml.includes('Active'),
      hasDateInfo: /\d{1,2}\/\d{1,2}\/\d{4}/.test(searchHtml),
      preview: searchHtml.substring(0, 3000),
      // Look for specific patterns
      caseNumberMatches: searchHtml.match(/[A-Z]{2}-\d{4}-\d{6}/g) || [],
      partyMatches: searchHtml.match(/(Plaintiff|Defendant|Petitioner|Respondent)[:\s]*([^<\n\r]+)/gi) || [],
      judgeMatches: searchHtml.match(/(Judge|Hon)[:\s]*([^<\n\r]+)/gi) || [],
      statusMatches: searchHtml.match(/(Status|Case Status)[:\s]*([^<\n\r]+)/gi) || [],
      dateMatches: searchHtml.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || []
    }
    
    return NextResponse.json({
      success: true,
      searchQuery,
      url: searchUrl,
      analysis,
      message: 'Real case search analysis completed'
    })
    
  } catch (error) {
    console.error('Real case search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Real case search test failed'
      },
      { status: 500 }
    )
  }
}
