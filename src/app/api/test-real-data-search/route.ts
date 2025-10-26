import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Real Data Search
 * This endpoint will try multiple approaches to get REAL case data from San Diego County
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'Smith' // Test with a common name
    console.log('🔍 Testing REAL data search for:', searchQuery)
    
    const results = {
      searchQuery,
      approaches: [] as any[],
      realDataFound: false,
      totalCases: 0
    }
    
    // Approach 1: Direct party name search
    try {
      console.log('🔍 Approach 1: Direct party name search')
      const url1 = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=${encodeURIComponent(searchQuery)}`
      
      const response1 = await fetch(url1, {
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
      })
      
      if (response1.ok) {
        const html1 = await response1.text()
        const analysis1 = analyzeHTML(html1, searchQuery)
        results.approaches.push({
          method: 'Direct party name search',
          url: url1,
          status: response1.status,
          htmlLength: html1.length,
          analysis: analysis1,
          hasRealData: analysis1.hasCaseData || analysis1.hasCaseNumbers || analysis1.hasPartyNames
        })
        
        if (analysis1.hasCaseData || analysis1.hasCaseNumbers || analysis1.hasPartyNames) {
          results.realDataFound = true
          results.totalCases += analysis1.caseNumberMatches.length
        }
      }
    } catch (error) {
      results.approaches.push({
        method: 'Direct party name search',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Approach 2: General search
    try {
      console.log('🔍 Approach 2: General search')
      const url2 = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?search=${encodeURIComponent(searchQuery)}`
      
      const response2 = await fetch(url2, {
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
      })
      
      if (response2.ok) {
        const html2 = await response2.text()
        const analysis2 = analyzeHTML(html2, searchQuery)
        results.approaches.push({
          method: 'General search',
          url: url2,
          status: response2.status,
          htmlLength: html2.length,
          analysis: analysis2,
          hasRealData: analysis2.hasCaseData || analysis2.hasCaseNumbers || analysis2.hasPartyNames
        })
        
        if (analysis2.hasCaseData || analysis2.hasCaseNumbers || analysis2.hasPartyNames) {
          results.realDataFound = true
          results.totalCases += analysis2.caseNumberMatches.length
        }
      }
    } catch (error) {
      results.approaches.push({
        method: 'General search',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Approach 3: Try with different case number format
    try {
      console.log('🔍 Approach 3: Case number search')
      const testCaseNumber = '22FL001581C'
      const url3 = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=${encodeURIComponent(testCaseNumber)}`
      
      const response3 = await fetch(url3, {
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
      })
      
      if (response3.ok) {
        const html3 = await response3.text()
        const analysis3 = analyzeHTML(html3, testCaseNumber)
        results.approaches.push({
          method: 'Case number search',
          url: url3,
          status: response3.status,
          htmlLength: html3.length,
          analysis: analysis3,
          hasRealData: analysis3.hasCaseData || analysis3.hasCaseNumbers || analysis3.hasPartyNames
        })
        
        if (analysis3.hasCaseData || analysis3.hasCaseNumbers || analysis3.hasPartyNames) {
          results.realDataFound = true
          results.totalCases += analysis3.caseNumberMatches.length
        }
      }
    } catch (error) {
      results.approaches.push({
        method: 'Case number search',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    return NextResponse.json({
      success: true,
      ...results,
      message: results.realDataFound ? 'REAL case data found!' : 'No real case data found - need to investigate further'
    })
    
  } catch (error) {
    console.error('Real data search test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Real data search test failed'
      },
      { status: 500 }
    )
  }
}

function analyzeHTML(html: string, searchQuery: string) {
  return {
    htmlLength: html.length,
    hasSearchForm: html.includes('search') && html.includes('form'),
    hasCaseData: html.includes('Case Title') || html.includes('case results'),
    hasCaseNumbers: /[A-Z]{2}-\d{4}-\d{6}/.test(html),
    hasPartyNames: html.includes('Plaintiff') || html.includes('Defendant'),
    hasJudgeInfo: html.includes('Judge') || html.includes('Hon'),
    hasStatusInfo: html.includes('Status') || html.includes('Active'),
    hasDateInfo: /\d{1,2}\/\d{1,2}\/\d{4}/.test(html),
    caseNumberMatches: html.match(/[A-Z]{2}-\d{4}-\d{6}/g) || [],
    partyMatches: html.match(/(Plaintiff|Defendant|Petitioner|Respondent)[:\s]*([^<\n\r]+)/gi) || [],
    judgeMatches: html.match(/(Judge|Hon)[:\s]*([^<\n\r]+)/gi) || [],
    statusMatches: html.match(/(Status|Case Status)[:\s]*([^<\n\r]+)/gi) || [],
    dateMatches: html.match(/\d{1,2}\/\d{1,2}\/\d{4}/g) || [],
    preview: html.substring(0, 2000)
  }
}
