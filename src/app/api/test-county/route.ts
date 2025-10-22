import { NextRequest, NextResponse } from 'next/server'

/**
 * Test San Diego County Court Data Integration
 * This endpoint helps debug the county data connection
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.sdcourt.ca.gov'
    
    // Test the San Diego County portal
    const testUrl = `${baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`
    
    console.log('Testing San Diego County connection...')
    console.log('URL:', testUrl)
    
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: testUrl
      })
    }

    const html = await response.text()
    const htmlPreview = html.substring(0, 1000)
    
    console.log('HTML preview:', htmlPreview)

    return NextResponse.json({
      success: true,
      status: response.status,
      url: testUrl,
      htmlPreview,
      message: 'Successfully connected to San Diego County portal'
    })

  } catch (error) {
    console.error('County test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to San Diego County portal'
      },
      { status: 500 }
    )
  }
}
