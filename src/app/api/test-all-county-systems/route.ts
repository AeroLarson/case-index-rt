import { NextRequest, NextResponse } from 'next/server'

/**
 * Comprehensive Test of All San Diego County Systems
 * This endpoint tests every possible way to access county data
 */
export async function GET(request: NextRequest) {
  const results = {
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  }

  // Test 1: Basic San Diego County website access
  try {
    console.log('Test 1: Basic San Diego County website access...')
    const response = await fetch('https://www.sdcourt.ca.gov', {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
      }
    })
    
    results.tests.push({
      name: 'Basic County Website',
      url: 'https://www.sdcourt.ca.gov',
      status: response.status,
      success: response.ok,
      message: response.ok ? 'Success' : `Failed: ${response.status}`
    })
    
    if (response.ok) results.summary.passed++
    else results.summary.failed++
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'Basic County Website',
      url: 'https://www.sdcourt.ca.gov',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 2: Case search page access
  try {
    console.log('Test 2: Case search page access...')
    const response = await fetch('https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch', {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
      }
    })
    
    results.tests.push({
      name: 'Case Search Page',
      url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch',
      status: response.status,
      success: response.ok,
      message: response.ok ? 'Success' : `Failed: ${response.status}`
    })
    
    if (response.ok) results.summary.passed++
    else results.summary.failed++
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'Case Search Page',
      url: 'https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 3: ROA system access
  try {
    console.log('Test 3: ROA system access...')
    const response = await fetch('https://roasearch.sdcourt.ca.gov', {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'X-Forwarded-For': '216.150.1.65',
        'X-Real-IP': '216.150.1.65',
      }
    })
    
    results.tests.push({
      name: 'ROA System',
      url: 'https://roasearch.sdcourt.ca.gov',
      status: response.status,
      success: response.ok,
      message: response.ok ? 'Success' : `Failed: ${response.status}`
    })
    
    if (response.ok) results.summary.passed++
    else results.summary.failed++
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'ROA System',
      url: 'https://roasearch.sdcourt.ca.gov',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 4: ROA Parties search
  try {
    console.log('Test 4: ROA Parties search...')
    const response = await fetch('https://roasearch.sdcourt.ca.gov/Parties', {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'X-Forwarded-For': '216.150.1.65',
        'X-Real-IP': '216.150.1.65',
      }
    })
    
    results.tests.push({
      name: 'ROA Parties Search',
      url: 'https://roasearch.sdcourt.ca.gov/Parties',
      status: response.status,
      success: response.ok,
      message: response.ok ? 'Success' : `Failed: ${response.status}`
    })
    
    if (response.ok) results.summary.passed++
    else results.summary.failed++
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'ROA Parties Search',
      url: 'https://roasearch.sdcourt.ca.gov/Parties',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  // Test 5: General search endpoint
  try {
    console.log('Test 5: General search endpoint...')
    const response = await fetch('https://www.sdcourt.ca.gov/search?search=test', {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
      }
    })
    
    results.tests.push({
      name: 'General Search',
      url: 'https://www.sdcourt.ca.gov/search?search=test',
      status: response.status,
      success: response.ok,
      message: response.ok ? 'Success' : `Failed: ${response.status}`
    })
    
    if (response.ok) results.summary.passed++
    else results.summary.failed++
    results.summary.total++
    
  } catch (error) {
    results.tests.push({
      name: 'General Search',
      url: 'https://www.sdcourt.ca.gov/search?search=test',
      status: 'ERROR',
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
    results.summary.failed++
    results.summary.total++
  }

  return NextResponse.json({
    success: true,
    results,
    message: `Completed ${results.summary.total} tests: ${results.summary.passed} passed, ${results.summary.failed} failed`
  })
}
