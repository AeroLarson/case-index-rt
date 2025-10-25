import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { JSDOM } = require('jsdom');
    
    // Test the actual San Diego County search
    const searchUrl = 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch?caseNumber=22FL001581C';
    
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

    // Analyze the HTML structure
    const analysis = {
      title: document.title,
      hasCaseNumber: html.includes('22FL001581C'),
      tables: Array.from(document.querySelectorAll('table')).map((table, i) => ({
        index: i,
        rows: table.rows.length,
        cells: Array.from(table.cells || []).map(cell => ({
          text: cell.textContent?.trim().substring(0, 100) || '',
          tagName: cell.tagName
        }))
      })),
      divs: Array.from(document.querySelectorAll('div')).filter(div => 
        div.textContent && div.textContent.includes('22FL001581C')
      ).map((div, i) => ({
        index: i,
        text: div.textContent?.trim().substring(0, 200) || '',
        className: div.className
      })),
      caseInfoElements: Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('22FL001581C')
      ).map((el, i) => ({
        index: i,
        tagName: el.tagName,
        text: el.textContent?.trim().substring(0, 150) || '',
        className: el.className
      }))
    };

    return NextResponse.json({
      success: true,
      htmlLength: html.length,
      analysis,
      message: 'HTML structure analysis completed'
    });

  } catch (error) {
    console.error('Debug HTML structure error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}