import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    // Test different IP configuration approaches
    const testCases = [
      {
        name: 'No IP Headers (Default)',
        url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=22FL001581C',
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
        name: 'Single IP Header',
        url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'X-Forwarded-For': '216.150.1.65'
        }
      },
      {
        name: 'Multiple IP Headers',
        url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'X-Forwarded-For': '216.150.1.65',
          'X-Real-IP': '216.150.1.65',
          'X-Client-IP': '216.150.1.65'
        }
      },
      {
        name: 'Alternative IP Format',
        url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=22FL001581C',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'X-Forwarded-For': '216.150.1.65, 127.0.0.1',
          'X-Real-IP': '216.150.1.65',
          'X-Client-IP': '216.150.1.65',
          'CF-Connecting-IP': '216.150.1.65'
        }
      },
      {
        name: 'Case Index Direct Access',
        url: 'https://courtindex.sdcourt.ca.gov/CISPublic/enter',
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
    
    for (const testCase of testCases) {
      try {
        const response = await fetch(testCase.url, {
          headers: testCase.headers
        });
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const result = {
          name: testCase.name,
          url: testCase.url,
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
          isCloudflare: html.includes('Just a moment') || html.includes('Cloudflare') || html.includes('DNS points to prohibited IP'),
          isProhibitedIP: html.includes('DNS points to prohibited IP'),
          tables: Array.from(document.querySelectorAll('table')).length,
          forms: Array.from(document.querySelectorAll('form')).length,
          // Look for actual case data in the HTML
          caseDataFound: html.includes('Larson, Tonya D.') || html.includes('Larson, Joshua A.') || html.includes('MORRIS, CHRISTOPHER S.'),
          registerOfActionsFound: html.includes('Stipulation & Order') || html.includes('Judgment') || html.includes('Notice of Entry')
        };
        
        results.push(result);
        
      } catch (error) {
        results.push({
          name: testCase.name,
          url: testCase.url,
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
        totalTests: results.length,
        successfulTests: results.filter(result => result.success).length,
        testsWithCaseData: successfulResults.length,
        bestTest: bestResult?.name || 'None',
        cloudflareBlocks: results.filter(result => result.isCloudflare).length,
        prohibitedIPBlocks: results.filter(result => result.isProhibitedIP).length
      },
      message: 'IP configuration test completed'
    });

  } catch (error) {
    console.error('IP configuration test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


