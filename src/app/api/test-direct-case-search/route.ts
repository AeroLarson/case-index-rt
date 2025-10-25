import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    // Try the direct case search URL that we know works
    const caseSearchUrl = 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=22FL001581C';
    
    const response = await fetch(caseSearchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `HTTP ${response.status}: ${response.statusText}` });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Look for case information in the HTML
    const caseInfo = {
      title: document.title,
      hasCaseNumber: html.includes('22FL001581C'),
      hasCaseTitle: html.includes('Case Title') || html.includes('Larson'),
      hasCaseType: html.includes('Case Type') || html.includes('Family Law'),
      hasStatus: html.includes('Case Status') || html.includes('Active'),
      hasDateFiled: html.includes('Date Filed') || html.includes('2/10/2022'),
      hasDepartment: html.includes('Department') || html.includes('702'),
      hasJudge: html.includes('Judicial Officer') || html.includes('MORRIS'),
      hasParties: html.includes('Petitioner') || html.includes('Respondent'),
      hasRegisterOfActions: html.includes('Register of Actions') || html.includes('Event Date'),
      
      // Look for specific case data patterns
      caseTitleMatch: html.match(/Case Title[:\s]*([^<\n]+)/i)?.[1] || '',
      caseTypeMatch: html.match(/Case Type[:\s]*([^<\n]+)/i)?.[1] || '',
      statusMatch: html.match(/Case Status[:\s]*([^<\n]+)/i)?.[1] || '',
      dateFiledMatch: html.match(/Date Filed[:\s]*([^<\n]+)/i)?.[1] || '',
      departmentMatch: html.match(/Department[:\s]*([^<\n]+)/i)?.[1] || '',
      judgeMatch: html.match(/Judicial Officer[:\s]*([^<\n]+)/i)?.[1] || '',
      
      // Look for parties
      petitionerMatch: html.match(/Petitioner[:\s]*([^<\n]+)/i)?.[1] || '',
      respondentMatch: html.match(/Respondent[:\s]*([^<\n]+)/i)?.[1] || '',
      
      // Look for register of actions
      registerOfActions: html.match(/Register of Actions[\s\S]*?<\/table>/i)?.[0] || '',
      
      // Check if this is a results page or form page
      isResultsPage: html.includes('Search Results') || html.includes('Case Information'),
      isFormPage: html.includes('Search Form') || html.includes('Enter Case Number'),
      
      // Look for any tables with case data
      tables: Array.from(document.querySelectorAll('table')).map((table, i) => ({
        index: i,
        rows: table.rows.length,
        text: table.textContent?.trim().substring(0, 1000) || ''
      }))
    };

    return NextResponse.json({
      success: true,
      url: caseSearchUrl,
      htmlLength: html.length,
      caseInfo,
      message: 'Direct case search test completed'
    });

  } catch (error) {
    console.error('Direct case search test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

