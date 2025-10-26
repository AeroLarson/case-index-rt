import { NextRequest, NextResponse } from 'next/server'
import { realCaseScraper } from '@/lib/realCaseScraper'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseNumber = searchParams.get('caseNumber') || '22FL001581C'
    
    console.log(`Testing real scraping for case: ${caseNumber}`)
    
    const realCaseData = await realCaseScraper.searchCase(caseNumber)
    
    if (realCaseData) {
      return NextResponse.json({
        success: true,
        message: 'Successfully scraped real case data',
        data: realCaseData
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'No case data found or scraping failed',
        data: null
      })
    }
    
  } catch (error) {
    console.error('Real scraping test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Scraping failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    // Clean up browser
    await realCaseScraper.close()
  }
}
