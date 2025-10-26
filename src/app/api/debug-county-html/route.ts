import { NextRequest, NextResponse } from 'next/server'

/**
 * Debug County HTML
 * This endpoint shows us exactly what HTML we're getting from San Diego County systems
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = '22FL001581C'
    console.log('🔍 Debugging San Diego County HTML for:', searchQuery)
    
    const results = {
      roasearch: null as any,
      odyroa: null as any,
      courtIndex: null as any,
      mainCounty: null as any
    }
    
    // Test ROASearch
    try {
      const roaUrl = 'https://roasearch.sdcourt.ca.gov/Parties?search=' + encodeURIComponent(searchQuery)
      console.log('Testing ROASearch:', roaUrl)
      
      const roaResponse = await fetch(roaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'X-Forwarded-For': '3.224.164.255',
          'X-Real-IP': '3.224.164.255',
        }
      })
      
      if (roaResponse.ok) {
        const html = await roaResponse.text()
        results.roasearch = {
          status: roaResponse.status,
          length: html.length,
          preview: html.substring(0, 2000),
          hasCaseData: html.includes('case') || html.includes('Case'),
          hasSearchForm: html.includes('search') && html.includes('form'),
          url: roaUrl
        }
      } else {
        results.roasearch = { error: `HTTP ${roaResponse.status}`, url: roaUrl }
      }
    } catch (error) {
      results.roasearch = { error: error instanceof Error ? error.message : 'Unknown error' }
    }
    
    // Test ODYROA
    try {
      const odyroaUrl = 'https://odyroa.sdcourt.ca.gov/Parties?search=' + encodeURIComponent(searchQuery)
      console.log('Testing ODYROA:', odyroaUrl)
      
      const odyroaResponse = await fetch(odyroaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'X-Forwarded-For': '3.224.164.255',
          'X-Real-IP': '3.224.164.255',
        }
      })
      
      if (odyroaResponse.ok) {
        const html = await odyroaResponse.text()
        results.odyroa = {
          status: odyroaResponse.status,
          length: html.length,
          preview: html.substring(0, 2000),
          hasCaseData: html.includes('case') || html.includes('Case'),
          hasSearchForm: html.includes('search') && html.includes('form'),
          url: odyroaUrl
        }
      } else {
        results.odyroa = { error: `HTTP ${odyroaResponse.status}`, url: odyroaUrl }
      }
    } catch (error) {
      results.odyroa = { error: error instanceof Error ? error.message : 'Unknown error' }
    }
    
    // Test CourtIndex
    try {
      const courtIndexUrl = 'https://courtindex.sdcourt.ca.gov/Parties?search=' + encodeURIComponent(searchQuery)
      console.log('Testing CourtIndex:', courtIndexUrl)
      
      const courtIndexResponse = await fetch(courtIndexUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'X-Forwarded-For': '3.224.164.255',
          'X-Real-IP': '3.224.164.255',
        }
      })
      
      if (courtIndexResponse.ok) {
        const html = await courtIndexResponse.text()
        results.courtIndex = {
          status: courtIndexResponse.status,
          length: html.length,
          preview: html.substring(0, 2000),
          hasCaseData: html.includes('case') || html.includes('Case'),
          hasSearchForm: html.includes('search') && html.includes('form'),
          url: courtIndexUrl
        }
      } else {
        results.courtIndex = { error: `HTTP ${courtIndexResponse.status}`, url: courtIndexUrl }
      }
    } catch (error) {
      results.courtIndex = { error: error instanceof Error ? error.message : 'Unknown error' }
    }
    
    // Test main San Diego County
    try {
      const mainUrl = 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=' + encodeURIComponent(searchQuery)
      console.log('Testing main San Diego County:', mainUrl)
      
      const mainResponse = await fetch(mainUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'X-Forwarded-For': '3.224.164.255',
          'X-Real-IP': '3.224.164.255',
        }
      })
      
      if (mainResponse.ok) {
        const html = await mainResponse.text()
        results.mainCounty = {
          status: mainResponse.status,
          length: html.length,
          preview: html.substring(0, 2000),
          hasCaseData: html.includes('case') || html.includes('Case'),
          hasSearchForm: html.includes('search') && html.includes('form'),
          url: mainUrl
        }
      } else {
        results.mainCounty = { error: `HTTP ${mainResponse.status}`, url: mainUrl }
      }
    } catch (error) {
      results.mainCounty = { error: error instanceof Error ? error.message : 'Unknown error' }
    }
    
    return NextResponse.json({
      success: true,
      searchQuery,
      results,
      message: 'Debug HTML analysis completed'
    })
    
  } catch (error) {
    console.error('Debug HTML error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Debug HTML failed'
      },
      { status: 500 }
    )
  }
}
