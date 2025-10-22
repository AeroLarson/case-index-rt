import { NextRequest, NextResponse } from 'next/server'

/**
 * Test San Diego County ROA Search System
 * This endpoint analyzes the ROA search form structure
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://roasearch.sdcourt.ca.gov'
    const searchUrl = `${baseUrl}/Parties`
    
    console.log('Testing San Diego County ROA search system...')
    console.log('ROA URL:', searchUrl)
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'CaseIndexRT/1.0 (Legal Technology Platform)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: searchUrl
      })
    }

    const html = await response.text()
    
    // Analyze the ROA search form
    const formRegex = /<form[^>]*>(.*?)<\/form>/gis;
    const forms = [];
    let formMatch;
    
    while ((formMatch = formRegex.exec(html)) !== null) {
      forms.push({
        formHtml: formMatch[0].substring(0, 500),
        formContent: formMatch[1].substring(0, 500)
      });
    }
    
    // Look for input fields
    const inputRegex = /<input[^>]*>/gi;
    const inputs = [];
    let inputMatch;
    
    while ((inputMatch = inputRegex.exec(html)) !== null) {
      inputs.push(inputMatch[0]);
    }
    
    // Look for select fields
    const selectRegex = /<select[^>]*>(.*?)<\/select>/gis;
    const selects = [];
    let selectMatch;
    
    while ((selectMatch = selectRegex.exec(html)) !== null) {
      selects.push({
        selectHtml: selectMatch[0].substring(0, 200),
        selectContent: selectMatch[1].substring(0, 200)
      });
    }
    
    // Look for buttons
    const buttonRegex = /<button[^>]*>(.*?)<\/button>/gis;
    const buttons = [];
    let buttonMatch;
    
    while ((buttonMatch = buttonRegex.exec(html)) !== null) {
      buttons.push({
        buttonHtml: buttonMatch[0].substring(0, 200),
        buttonContent: buttonMatch[1].substring(0, 200)
      });
    }

    // Look for any case-related content or examples
    const caseExamples = html.match(/[A-Z]{2}-\d{4}-\d{6}/gi) || []
    const hasCaseExamples = caseExamples.length > 0

    return NextResponse.json({
      success: true,
      status: response.status,
      url: searchUrl,
      analysis: {
        formsFound: forms.length,
        inputsFound: inputs.length,
        selectsFound: selects.length,
        buttonsFound: buttons.length,
        caseExamplesFound: caseExamples.length,
        caseExamples: caseExamples.slice(0, 5),
        hasCaseExamples,
        forms: forms.slice(0, 3),
        inputs: inputs.slice(0, 10),
        selects: selects.slice(0, 3),
        buttons: buttons.slice(0, 3)
      },
      htmlPreview: html.substring(0, 2000),
      message: 'Successfully analyzed San Diego County ROA search form'
    })

  } catch (error) {
    console.error('ROA search test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze San Diego County ROA search form'
      },
      { status: 500 }
    )
  }
}
