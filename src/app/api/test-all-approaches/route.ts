import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    const testCaseNumber = '22FL001581C';
    const approaches = [];
    
    // Approach 1: Direct case search URL
    try {
      const url1 = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=${testCaseNumber}`;
      const response1 = await fetch(url1, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      const html1 = await response1.text();
      const dom1 = new JSDOM(html1);
      const doc1 = dom1.window.document;
      
      approaches.push({
        name: 'Direct case search URL',
        url: url1,
        status: response1.status,
        success: response1.ok,
        hasCaseData: html1.includes('Case Title') || html1.includes('Larson'),
        hasCaseNumber: html1.includes(testCaseNumber),
        isFormPage: html1.includes('Search Form') || html1.includes('Enter Case Number'),
        isResultsPage: html1.includes('Search Results') || html1.includes('Case Information'),
        htmlLength: html1.length,
        title: doc1.title
      });
    } catch (error) {
      approaches.push({
        name: 'Direct case search URL',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Approach 2: General search with case number
    try {
      const url2 = `https://www.sdcourt.ca.gov/search?search=${testCaseNumber}`;
      const response2 = await fetch(url2, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      const html2 = await response2.text();
      const dom2 = new JSDOM(html2);
      const doc2 = dom2.window.document;
      
      approaches.push({
        name: 'General search with case number',
        url: url2,
        status: response2.status,
        success: response2.ok,
        hasCaseData: html2.includes('Case Title') || html2.includes('Larson'),
        hasCaseNumber: html2.includes(testCaseNumber),
        isFormPage: html2.includes('Search Form') || html2.includes('Enter Case Number'),
        isResultsPage: html2.includes('Search Results') || html2.includes('Case Information'),
        htmlLength: html2.length,
        title: doc2.title
      });
    } catch (error) {
      approaches.push({
        name: 'General search with case number',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Approach 3: Try with party name search
    try {
      const url3 = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=Larson`;
      const response3 = await fetch(url3, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      const html3 = await response3.text();
      const dom3 = new JSDOM(html3);
      const doc3 = dom3.window.document;
      
      approaches.push({
        name: 'Party name search',
        url: url3,
        status: response3.status,
        success: response3.ok,
        hasCaseData: html3.includes('Case Title') || html3.includes('Larson'),
        hasCaseNumber: html3.includes(testCaseNumber),
        isFormPage: html3.includes('Search Form') || html3.includes('Enter Case Number'),
        isResultsPage: html3.includes('Search Results') || html3.includes('Case Information'),
        htmlLength: html3.length,
        title: doc3.title
      });
    } catch (error) {
      approaches.push({
        name: 'Party name search',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Approach 4: Try with attorney search
    try {
      const url4 = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?attorneyName=DA SILVA`;
      const response4 = await fetch(url4, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      const html4 = await response4.text();
      const dom4 = new JSDOM(html4);
      const doc4 = dom4.window.document;
      
      approaches.push({
        name: 'Attorney search',
        url: url4,
        status: response4.status,
        success: response4.ok,
        hasCaseData: html4.includes('Case Title') || html4.includes('Larson'),
        hasCaseNumber: html4.includes(testCaseNumber),
        isFormPage: html4.includes('Search Form') || html4.includes('Enter Case Number'),
        isResultsPage: html4.includes('Search Results') || html4.includes('Case Information'),
        htmlLength: html4.length,
        title: doc4.title
      });
    } catch (error) {
      approaches.push({
        name: 'Attorney search',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Find the best approach
    const successfulApproaches = approaches.filter(approach => approach.success && approach.hasCaseData);
    const bestApproach = successfulApproaches.length > 0 ? successfulApproaches[0] : approaches.find(approach => approach.success);
    
    return NextResponse.json({
      success: true,
      testCaseNumber,
      approaches,
      bestApproach,
      summary: {
        totalApproaches: approaches.length,
        successfulApproaches: approaches.filter(approach => approach.success).length,
        approachesWithCaseData: successfulApproaches.length,
        bestApproach: bestApproach?.name || 'None'
      },
      message: 'All approaches test completed'
    });

  } catch (error) {
    console.error('All approaches test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

