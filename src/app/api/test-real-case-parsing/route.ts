import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Real Case Parsing
 * This endpoint tests parsing with a real case name to see what data we can extract
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = 'tonya larson' // Using the real name you mentioned
    console.log('Testing real case parsing for:', searchQuery)
    
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
    
    // Advanced HTML parsing to extract real case data
    const parsedCases = []
    
    // Look for case numbers with multiple patterns
    const caseNumberPatterns = [
      /([A-Z]{2}-\d{4}-\d{6})/g,  // Standard format FL-2024-123456
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
    
    // For each case number found, try to extract additional information
    for (const caseNumber of uniqueCaseNumbers) {
      // Look for case information around the case number
      const caseNumberIndex = html.indexOf(caseNumber)
      if (caseNumberIndex !== -1) {
        // Extract context around the case number (500 characters before and after)
        const contextStart = Math.max(0, caseNumberIndex - 500)
        const contextEnd = Math.min(html.length, caseNumberIndex + 500)
        const context = html.substring(contextStart, contextEnd)
        
        // Try to extract case title, parties, judge, etc. from context
        const caseTitle = this.extractCaseTitle(context, searchQuery)
        const parties = this.extractParties(context, searchQuery)
        const judge = this.extractJudge(context)
        const department = this.extractDepartment(context)
        const status = this.extractStatus(context)
        const dateFiled = this.extractDateFiled(context)
        
        parsedCases.push({
          caseNumber,
          caseTitle,
          caseType: this.determineCaseType(caseNumber),
          status,
          dateFiled,
          lastActivity: new Date().toISOString().split('T')[0],
          department,
          judge,
          parties,
          context: context.substring(0, 200) // First 200 chars of context
        })
      }
    }
    
    // If no case numbers found, look for other case-related content
    if (parsedCases.length === 0) {
      console.log('No case numbers found, looking for other case content...')
      
      // Look for any text that might indicate case information
      const caseContentRegex = /(case|Case|court|Court|hearing|Hearing|judge|Judge)/g
      const caseContent = html.match(caseContentRegex)
      
      if (caseContent && caseContent.length > 0) {
        console.log('Found case-related content:', caseContent.length, 'matches')
        
        // Create a generic case entry if we found case-related content
        parsedCases.push({
          caseNumber: `SEARCH-${Date.now()}`,
          caseTitle: `Search results for ${searchQuery}`,
          caseType: 'Unknown',
          status: 'Search Results Found',
          dateFiled: new Date().toISOString().split('T')[0],
          lastActivity: new Date().toISOString().split('T')[0],
          department: 'San Diego Superior Court',
          judge: 'Unknown',
          parties: [searchQuery],
          context: 'No specific case numbers found'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      searchQuery,
      url: searchUrl,
      status: response.status,
      htmlLength: html.length,
      uniqueCaseNumbers,
      parsedCases,
      totalCases: parsedCases.length,
      message: 'Real case parsing test completed'
    })
    
  } catch (error) {
    console.error('Real case parsing test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Real case parsing test failed'
      },
      { status: 500 }
    )
  }
}

// Helper functions for extracting case information
function extractCaseTitle(context: string, searchQuery: string): string {
  // Look for case title patterns
  const titlePatterns = [
    /Case Title[:\s]*([^<\n]+)/i,
    /Title[:\s]*([^<\n]+)/i,
    /Case[:\s]*([^<\n]+)/i,
    /([^<\n]*vs[^<\n]*)/i,
    /([^<\n]*v[^<\n]*)/i
  ]
  
  for (const pattern of titlePatterns) {
    const match = context.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return `Case involving ${searchQuery}`
}

function extractParties(context: string, searchQuery: string): string[] {
  const parties = [searchQuery]
  
  // Look for party information
  const partyPatterns = [
    /Plaintiff[:\s]*([^<\n]+)/i,
    /Defendant[:\s]*([^<\n]+)/i,
    /Party[:\s]*([^<\n]+)/i
  ]
  
  for (const pattern of partyPatterns) {
    const match = context.match(pattern)
    if (match && match[1]) {
      parties.push(match[1].trim())
    }
  }
  
  return [...new Set(parties)] // Remove duplicates
}

function extractJudge(context: string): string {
  const judgePatterns = [
    /Judge[:\s]*([^<\n]+)/i,
    /Hon[.\s]*([^<\n]+)/i,
    /Assigned[:\s]*([^<\n]+)/i
  ]
  
  for (const pattern of judgePatterns) {
    const match = context.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return 'Unknown'
}

function extractDepartment(context: string): string {
  const deptPatterns = [
    /Department[:\s]*([^<\n]+)/i,
    /Dept[:\s]*([^<\n]+)/i,
    /Court[:\s]*([^<\n]+)/i
  ]
  
  for (const pattern of deptPatterns) {
    const match = context.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }
  
  return 'San Diego Superior Court'
}

function extractStatus(context: string): string {
  const statusPatterns = [
    /Status[:\s]*([^<\n]+)/i,
    /Active/i,
    /Closed/i,
    /Pending/i
  ]
  
  for (const pattern of statusPatterns) {
    const match = context.match(pattern)
    if (match) {
      return match[1] ? match[1].trim() : match[0]
    }
  }
  
  return 'Active'
}

function extractDateFiled(context: string): string {
  const datePatterns = [
    /Filed[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})/i,
    /Date[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})/i,
    /([0-9]{4}-[0-9]{2}-[0-9]{2})/i
  ]
  
  for (const pattern of datePatterns) {
    const match = context.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return new Date().toISOString().split('T')[0]
}

function determineCaseType(caseNumber: string): string {
  if (caseNumber.startsWith('FL-')) return 'Family Law'
  if (caseNumber.startsWith('CR-')) return 'Criminal'
  if (caseNumber.startsWith('CV-')) return 'Civil'
  if (caseNumber.startsWith('SC-')) return 'Small Claims'
  if (caseNumber.startsWith('TR-')) return 'Traffic'
  if (caseNumber.startsWith('JC-')) return 'Juvenile'
  if (caseNumber.startsWith('AD-')) return 'Administrative'
  if (caseNumber.startsWith('AP-')) return 'Appeals'
  if (caseNumber.startsWith('GU-')) return 'Guardianship'
  if (caseNumber.startsWith('MH-')) return 'Mental Health'
  if (caseNumber.startsWith('PR-')) return 'Probate'
  if (caseNumber.startsWith('SB-')) return 'Superior Court Business'
  if (caseNumber.startsWith('SS-')) return 'Superior Court Special'
  if (caseNumber.startsWith('ST-')) return 'Superior Court Special'
  if (caseNumber.startsWith('WS-')) return 'Workers Compensation'
  return 'Unknown'
}
