import { NextRequest, NextResponse } from 'next/server'

/**
 * Test San Diego County Case Search Form
 * This endpoint helps debug the county search form structure
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = 'https://www.sdcourt.ca.gov'
    const searchUrl = `${baseUrl}/sdcourt/generalinformation/courtrecords2/onlinecasesearch`
    
    console.log('Testing San Diego County search form...')
    console.log('URL:', searchUrl)
    
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
    
    // Look for form elements in the HTML
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

    return NextResponse.json({
      success: true,
      status: response.status,
      url: searchUrl,
      analysis: {
        formsFound: forms.length,
        inputsFound: inputs.length,
        selectsFound: selects.length,
        buttonsFound: buttons.length,
        forms: forms.slice(0, 3), // First 3 forms
        inputs: inputs.slice(0, 10), // First 10 inputs
        selects: selects.slice(0, 3), // First 3 selects
        buttons: buttons.slice(0, 3) // First 3 buttons
      },
      htmlPreview: html.substring(0, 2000),
      message: 'Successfully analyzed San Diego County search form'
    })

  } catch (error) {
    console.error('County search form test error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to analyze San Diego County search form'
      },
      { status: 500 }
    )
  }
}
