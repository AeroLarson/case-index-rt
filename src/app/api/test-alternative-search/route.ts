import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    // Try alternative search endpoints and methods
    const searchEndpoints = [
      {
        name: 'Court Index System',
        url: 'https://courtindex.sdcourt.ca.gov/CISPublic/enter?caseNumber=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      },
      {
        name: 'ROA Search System',
        url: 'https://roasearch.sdcourt.ca.gov/Parties?caseNumber=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'X-Forwarded-For': '216.150.1.65',
          'X-Real-IP': '216.150.1.65',
        }
      },
      {
        name: 'Alternative Case Search',
        url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?search=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      },
      {
        name: 'General Search with Case Number',
        url: 'https://www.sdcourt.ca.gov/search?search=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      }
    ];
    
    const results = [];
    
    for (const endpoint of searchEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: endpoint.headers
        });
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const result = {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          success: response.ok,
          htmlLength: html.length,
          title: document.title,
          hasCaseNumber: html.includes('22FL001581C'),
          hasCaseData: html.includes('Case Title') || html.includes('Larson') || html.includes('Tonya'),
          hasCaseTitle: html.includes('Case Title') || html.includes('Larson'),
          hasCaseType: html.includes('Case Type') || html.includes('Family Law'),
          hasStatus: html.includes('Case Status') || html.includes('Active'),
          hasDateFiled: html.includes('Date Filed') || html.includes('2/10/2022'),
          hasDepartment: html.includes('Department') || html.includes('702'),
          hasJudge: html.includes('Judicial Officer') || html.includes('MORRIS'),
          hasParties: html.includes('Petitioner') || html.includes('Respondent'),
          hasRegisterOfActions: html.includes('Register of Actions') || html.includes('Event Date'),
          isErrorPage: html.includes('Error') || html.includes('Not Found') || html.includes('Forbidden'),
          isFormPage: html.includes('Search Form') || html.includes('Enter Case Number'),
          isResultsPage: html.includes('Search Results') || html.includes('Case Information'),
          tables: Array.from(document.querySelectorAll('table')).length,
          forms: Array.from(document.querySelectorAll('form')).length
        };
        
        results.push(result);
        
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Find the best result
    const successfulResults = results.filter(result => result.success && result.hasCaseData);
    const bestResult = successfulResults.length > 0 ? successfulResults[0] : results.find(result => result.success);
    
    return NextResponse.json({
      success: true,
      results,
      bestResult,
      summary: {
        totalEndpoints: results.length,
        successfulEndpoints: results.filter(result => result.success).length,
        endpointsWithCaseData: successfulResults.length,
        bestEndpoint: bestResult?.name || 'None'
      },
      message: 'Alternative search test completed'
    });

  } catch (error) {
    console.error('Alternative search test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


