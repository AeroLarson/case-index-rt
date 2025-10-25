import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    // Step 1: Get the search form page
    const formUrl = 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch';
    
    const formResponse = await fetch(formUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!formResponse.ok) {
      return NextResponse.json({ error: `Form fetch error: ${formResponse.status}` });
    }

    const formHtml = await formResponse.text();
    const formDom = new JSDOM(formHtml);
    const formDocument = formDom.window.document;

    // Step 2: Find the search form and extract its action/method
    const searchForm = formDocument.querySelector('form');
    if (!searchForm) {
      return NextResponse.json({ error: 'No search form found' });
    }

    const formAction = searchForm.getAttribute('action') || '/search';
    const formMethod = searchForm.getAttribute('method') || 'get';
    
    // Step 3: Extract all form fields (including hidden ones)
    const formData = new URLSearchParams();
    const inputs = formDocument.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const name = input.getAttribute('name');
      const value = input.getAttribute('value') || '';
      const type = input.getAttribute('type');
      
      if (name) {
        if (type === 'hidden' || type === 'text') {
          formData.append(name, value);
        }
      }
    });
    
    // Step 4: Set the search query
    formData.set('search', '22FL001581C');
    
    // Step 5: Submit the form
    const searchUrl = formAction.startsWith('http') ? formAction : `https://www.sdcourt.ca.gov${formAction}`;
    
    let searchResponse;
    if (formMethod.toLowerCase() === 'get') {
      // For GET requests, append form data to URL
      const urlWithParams = `${searchUrl}?${formData.toString()}`;
      searchResponse = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Referer': formUrl
        }
      });
    } else {
      // For POST requests, send form data in body
      searchResponse = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': formUrl
        },
        body: formData.toString()
      });
    }

    if (!searchResponse.ok) {
      return NextResponse.json({ error: `Search error: ${searchResponse.status}` });
    }

    const searchHtml = await searchResponse.text();
    const searchDom = new JSDOM(searchHtml);
    const searchDocument = searchDom.window.document;

    // Step 6: Analyze the results
    const analysis = {
      formAction,
      formMethod,
      formFields: Array.from(inputs).map(input => ({
        name: input.getAttribute('name'),
        type: input.getAttribute('type'),
        value: input.getAttribute('value')
      })),
      searchUrl,
      searchHtmlLength: searchHtml.length,
      hasCaseNumber: searchHtml.includes('22FL001581C'),
      hasResults: searchHtml.includes('Case Number') || searchHtml.includes('Case Title'),
      tables: Array.from(searchDocument.querySelectorAll('table')).map((table, i) => ({
        index: i,
        rows: table.rows.length,
        text: table.textContent?.trim().substring(0, 500) || ''
      })),
      caseElements: Array.from(searchDocument.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('22FL001581C')
      ).map((el, i) => ({
        index: i,
        tagName: el.tagName,
        text: el.textContent?.trim().substring(0, 200) || '',
        className: el.className
      }))
    };

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Form submission test completed'
    });

  } catch (error) {
    console.error('Form submission test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}