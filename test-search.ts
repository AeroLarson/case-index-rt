/**
 * Test script to debug San Diego County search
 * Run with: npx tsx test-search.ts
 */

import { countyDataService } from './src/lib/countyDataService';

async function testSearch() {
  console.log('🔍 Testing San Diego County search...\n');
  
  // Test with a common name
  const testQueries = [
    'Smith',
    'Johnson', 
    '22FL001581',
    'Larson'
  ];
  
  for (const query of testQueries) {
    console.log(`\n📋 Testing search: "${query}"`);
    console.log('='.repeat(50));
    
    try {
      const results = await countyDataService.searchCases(query, 'all');
      console.log(`✅ Found ${results.length} cases`);
      
      if (results.length > 0) {
        results.forEach((case_, idx) => {
          console.log(`\n  Case ${idx + 1}:`);
          console.log(`    Number: ${case_.caseNumber}`);
          console.log(`    Title: ${case_.caseTitle}`);
          console.log(`    Parties: ${case_.parties.join(', ')}`);
          console.log(`    Type: ${case_.caseType}`);
          console.log(`    Status: ${case_.status}`);
        });
      } else {
        console.log('❌ No cases found');
      }
    } catch (error: any) {
      console.error(`❌ Error: ${error.message}`);
      console.error(error.stack);
    }
    
    // Wait a bit between searches to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testSearch().catch(console.error);

