/**
 * Debug script to save and analyze HTML responses from San Diego County
 */

import * as fs from 'fs';

async function debugSearch() {
  const baseUrl = 'https://www.sdcourt.ca.gov';
  const searchQuery = 'Smith'; // Common name for testing
  
  console.log(`🔍 Fetching search results for: "${searchQuery}"`);
  
  const searchUrl = `${baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch?partyName=${encodeURIComponent(searchQuery)}`;
  console.log(`📡 URL: ${searchUrl}`);
  
  try {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `${baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`,
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const html = await response.text();
    console.log(`📄 HTML Length: ${html.length} characters`);
    
    // Save to file for inspection
    fs.writeFileSync('debug-html-response.html', html);
    console.log('💾 Saved HTML to debug-html-response.html');
    
    // Check for key indicators
    console.log('\n🔍 Analysis:');
    console.log(`  - Contains "search": ${html.toLowerCase().includes('search')}`);
    console.log(`  - Contains "form": ${html.toLowerCase().includes('<form')}`);
    console.log(`  - Contains "case": ${html.toLowerCase().includes('case')}`);
    console.log(`  - Contains "Smith": ${html.toLowerCase().includes('smith')}`);
    console.log(`  - Contains case number pattern: ${/FL-\d{4}-\d{6}/i.test(html)}`);
    console.log(`  - Contains table: ${html.toLowerCase().includes('<table')}`);
    console.log(`  - Contains div with results: ${html.toLowerCase().includes('results')}`);
    
    // Try to find any case numbers
    const caseNumberPatterns = [
      /FL-\d{4}-\d{6}/gi,
      /\d{2}FL\d{6}[A-Z]?/gi,
      /Case\s+Number[:\s]*([A-Z]{2}[-]?\d{4}[-]?\d{6})/gi,
    ];
    
    console.log('\n🔍 Case Numbers Found:');
    for (const pattern of caseNumberPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        console.log(`  Pattern ${pattern}: ${matches.slice(0, 5).join(', ')}`);
      }
    }
    
    // Look for party names
    console.log('\n🔍 Party Information:');
    const partyMatches = html.match(/Smith[^<]{0,100}(?:v\.?|vs\.?|vs)[^<]{0,100}/gi);
    if (partyMatches) {
      console.log(`  Found ${partyMatches.length} potential party matches`);
      partyMatches.slice(0, 3).forEach((match, i) => {
        console.log(`    ${i + 1}: ${match.substring(0, 150)}`);
      });
    }
    
    // Extract first 5000 chars for quick view
    console.log('\n📄 First 5000 characters:');
    console.log(html.substring(0, 5000));
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

debugSearch().catch(console.error);

