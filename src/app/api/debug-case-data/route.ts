import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    // Test the party name search that we know works
    const searchUrl = 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=Larson';
    
    const response = await fetch(searchUrl, {
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

    // Find all elements that contain case-related keywords
    const caseKeywords = ['Case Number', 'Case Title', 'Case Type', 'Case Status', 'Date Filed', 'Department', 'Judicial Officer', 'Petitioner', 'Respondent', 'Register of Actions'];
    const caseElements = [];
    
    for (const keyword of caseKeywords) {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes(keyword)
      );
      
      elements.forEach((el, i) => {
        caseElements.push({
          keyword,
          tagName: el.tagName,
          text: el.textContent?.trim().substring(0, 200) || '',
          className: el.className,
          id: el.id,
          parentTag: el.parentElement?.tagName || '',
          parentClassName: el.parentElement?.className || ''
        });
      });
    }
    
    // Look for any elements containing "Larson" or "22FL001581C"
    const larsonElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && (el.textContent.includes('Larson') || el.textContent.includes('22FL001581C'))
    ).map((el, i) => ({
      index: i,
      tagName: el.tagName,
      text: el.textContent?.trim().substring(0, 300) || '',
      className: el.className,
      id: el.id,
      parentTag: el.parentElement?.tagName || '',
      parentClassName: el.parentElement?.className || ''
    }));
    
    // Look for any tables
    const tables = Array.from(document.querySelectorAll('table')).map((table, i) => ({
      index: i,
      rows: table.rows.length,
      text: table.textContent?.trim().substring(0, 1000) || '',
      className: table.className,
      id: table.id
    }));
    
    // Look for any forms
    const forms = Array.from(document.querySelectorAll('form')).map((form, i) => ({
      index: i,
      action: form.action,
      method: form.method,
      text: form.textContent?.trim().substring(0, 500) || '',
      className: form.className,
      id: form.id
    }));

    return NextResponse.json({
      success: true,
      url: searchUrl,
      htmlLength: html.length,
      title: document.title,
      caseElements: caseElements.slice(0, 20), // Limit to first 20
      larsonElements: larsonElements.slice(0, 10), // Limit to first 10
      tables: tables.slice(0, 5), // Limit to first 5
      forms: forms.slice(0, 3), // Limit to first 3
      message: 'Case data debug completed'
    });

  } catch (error) {
    console.error('Case data debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}


