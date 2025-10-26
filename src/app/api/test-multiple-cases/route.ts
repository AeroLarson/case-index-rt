import { NextRequest, NextResponse } from 'next/server'
import { countyDataService } from '@/lib/countyDataService'

/**
 * Test Multiple Cases
 * This endpoint tests the search with multiple case numbers to ensure consistency
 */
export async function GET(request: NextRequest) {
  try {
    const testCases = [
      '22FL001581C', // Your real case
      'FL-2024-001234', // Test case format
      'CR-2024-005678', // Criminal case format
      'CV-2024-009876', // Civil case format
    ];
    
    console.log('🔍 Testing multiple case numbers...');
    
    const allResults = [];
    
    for (const caseNumber of testCases) {
      try {
        console.log(`Testing case: ${caseNumber}`);
        const results = await countyDataService.searchCases(caseNumber, 'caseNumber');
        allResults.push({
          caseNumber,
          results: results,
          count: results.length
        });
        
        // Small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Error testing case ${caseNumber}:`, error);
        allResults.push({
          caseNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
          count: 0
        });
      }
    }
    
    // Get final rate limit status
    const roaStatus = countyDataService.getRateLimitStatus('roasearch');
    const odyroaStatus = countyDataService.getRateLimitStatus('odyroa');
    const courtIndexStatus = countyDataService.getRateLimitStatus('courtindex');
    
    return NextResponse.json({
      success: true,
      testCases: allResults,
      totalTests: testCases.length,
      successfulTests: allResults.filter(r => r.count > 0).length,
      rateLimits: {
        roasearch: roaStatus,
        odyroa: odyroaStatus,
        courtIndex: courtIndexStatus
      },
      message: 'Multiple case testing completed'
    });
    
  } catch (error) {
    console.error('Multiple case test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Multiple case test failed'
      },
      { status: 500 }
    );
  }
}
