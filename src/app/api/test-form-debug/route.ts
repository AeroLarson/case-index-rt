import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Form Debug
 * This endpoint debugs the exact form submission process step by step
 */
export async function GET(request: NextRequest) {
  try {
    const searchQuery = '22FL001581C' // Using your real case number
    console.log('🔍 Debugging form submission for:', searchQuery)
    
    // Step 1: Get the search form
    const formUrl = `https://www.sdcourt.ca.gov/sdcourt/generalinformation/courtrecords2/onlinecasesearch`
    console.log('Step 1: Getting form from:', formUrl)
    
    const formResponse = await fetch(formUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!formResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Form fetch error: ${formResponse.status}`,
        step: 'form_fetch'
      })
    }

    const formHtml = await formResponse.text()
    console.log('✅ Form HTML length:', formHtml.length)
    
    // Step 2: Extract form details
    const formActionMatch = formHtml.match(/<form[^>]*action="([^"]*)"[^>]*>/i)
    const formMethodMatch = formHtml.match(/<form[^>]*method="([^"]*)"[^>]*>/i)
    const formAction = formActionMatch ? formActionMatch[1] : '/sdcourt/generalinformation/courtrecords2/onlinecasesearch'
    const formMethod = formMethodMatch ? formMethodMatch[1] : 'POST'
    
    console.log('Step 2: Form action:', formAction)
    console.log('Step 2: Form method:', formMethod)
    
    // Step 3: Extract hidden fields
    const hiddenFields = []
    const hiddenFieldRegex = /<input[^>]*type="hidden"[^>]*name="([^"]*)"[^>]*value="([^"]*)"[^>]*>/gi
    let hiddenMatch
    while ((hiddenMatch = hiddenFieldRegex.exec(formHtml)) !== null) {
      hiddenFields.push({
        name: hiddenMatch[1],
        value: hiddenMatch[2]
      })
    }
    
    console.log('Step 3: Hidden fields found:', hiddenFields.length)
    console.log('Hidden fields:', hiddenFields)
    
    // Step 4: Determine search field
    let searchField = 'caseNumber' // Default for case numbers
    if (searchQuery.match(/^\d{2}[A-Z]{2}\d{6}[A-Z]?$/)) {
      searchField = 'caseNumber'
    } else if (searchQuery.includes(' ')) {
      searchField = 'partyName'
    } else {
      searchField = 'search'
    }
    
    console.log('Step 4: Using search field:', searchField)
    
    // Step 5: Prepare form data
    const formData = new URLSearchParams()
    formData.append(searchField, searchQuery)
    
    // Add hidden fields
    for (const field of hiddenFields) {
      formData.append(field.name, field.value)
    }
    
    console.log('Step 5: Form data prepared')
    console.log('Form data:', formData.toString())
    
    // Step 6: Submit the form
    const searchUrl = `https://www.sdcourt.ca.gov${formAction}`
    console.log('Step 6: Submitting to:', searchUrl)
    
    const searchResponse = await fetch(searchUrl, {
      method: formMethod,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': formUrl,
        'Origin': 'https://www.sdcourt.ca.gov',
      },
      body: formData.toString()
    })

    console.log('Step 6: Search response status:', searchResponse.status)
    
    if (!searchResponse.ok) {
      return NextResponse.json({
        success: false,
        error: `Search submission error: ${searchResponse.status}`,
        step: 'form_submission',
        formAction,
        formMethod,
        searchField,
        hiddenFields
      })
    }

    const searchHtml = await searchResponse.text()
    console.log('✅ Search results HTML length:', searchHtml.length)
    
    // Step 7: Analyze the results
    const analysis = {
      htmlLength: searchHtml.length,
      hasCaseNumbers: /(\d{2}[A-Z]{2}\d{6}[A-Z]?)/.test(searchHtml),
      hasTables: searchHtml.includes('<table'),
      hasLists: searchHtml.includes('<ul') || searchHtml.includes('<ol'),
      hasDivs: searchHtml.includes('<div'),
      hasLinks: searchHtml.includes('<a'),
      hasForms: searchHtml.includes('<form'),
      hasButtons: searchHtml.includes('<button'),
      hasInputs: searchHtml.includes('<input'),
      hasSelects: searchHtml.includes('<select'),
      hasParagraphs: searchHtml.includes('<p'),
      hasHeaders: searchHtml.includes('<h1') || searchHtml.includes('<h2') || searchHtml.includes('<h3'),
      hasResults: searchHtml.includes('result') || searchHtml.includes('Result') || searchHtml.includes('found') || searchHtml.includes('Found'),
      hasNoResults: searchHtml.includes('No results') || searchHtml.includes('no results') || searchHtml.includes('No cases found') || searchHtml.includes('no cases found'),
      hasCaseContent: searchHtml.includes('case') || searchHtml.includes('Case') || searchHtml.includes('court') || searchHtml.includes('Court'),
      hasHearingContent: searchHtml.includes('hearing') || searchHtml.includes('Hearing') || searchHtml.includes('judge') || searchHtml.includes('Judge'),
      hasDateContent: searchHtml.includes('date') || searchHtml.includes('Date') || searchHtml.includes('filed') || searchHtml.includes('Filed'),
      hasSearchForm: searchHtml.includes('search') || searchHtml.includes('Search'),
      hasSubmitButton: searchHtml.includes('submit') || searchHtml.includes('Submit'),
      hasJavaScript: searchHtml.includes('<script'),
      hasCSS: searchHtml.includes('<style') || searchHtml.includes('css'),
      hasMeta: searchHtml.includes('<meta'),
      hasTitle: searchHtml.includes('<title')
    }
    
    // Look for case numbers
    const caseNumberPatterns = [
      /(\d{2}[A-Z]{2}\d{6}[A-Z]?)/g,  // Format like 22FL001581C
      /([A-Z]{2}-\d{4}-\d{6})/g,      // Standard format FL-2024-123456
    ]
    
    const allCaseNumbers = []
    for (const pattern of caseNumberPatterns) {
      const matches = searchHtml.match(pattern)
      if (matches) {
        allCaseNumbers.push(...matches)
      }
    }
    
    const uniqueCaseNumbers = [...new Set(allCaseNumbers)]
    
    // Look for case information
    const caseInfoPatterns = [
      /Case Number[:\s]*([^<\n]+)/i,
      /Case Title[:\s]*([^<\n]+)/i,
      /Case Type[:\s]*([^<\n]+)/i,
      /Case Status[:\s]*([^<\n]+)/i,
      /Date Filed[:\s]*([^<\n]+)/i,
      /Department[:\s]*([^<\n]+)/i,
      /Judicial Officer[:\s]*([^<\n]+)/i,
      /Petitioner[:\s]*([^<\n]+)/i,
      /Respondent[:\s]*([^<\n]+)/i
    ]
    
    const caseInfo = {}
    for (const pattern of caseInfoPatterns) {
      const match = searchHtml.match(pattern)
      if (match && match[1]) {
        const key = pattern.source.split('[')[0].replace(/[^a-zA-Z]/g, '').toLowerCase()
        caseInfo[key] = match[1].trim()
      }
    }
    
    return NextResponse.json({
      success: true,
      searchQuery,
      steps: {
        formFetch: '✅ Success',
        formAnalysis: '✅ Success',
        hiddenFields: '✅ Success',
        searchField: '✅ Success',
        formSubmission: '✅ Success',
        resultAnalysis: '✅ Success'
      },
      formDetails: {
        action: formAction,
        method: formMethod,
        searchField,
        hiddenFieldsCount: hiddenFields.length
      },
      analysis,
      uniqueCaseNumbers,
      caseInfo,
      htmlPreview: searchHtml.substring(0, 5000),
      message: 'Form submission debug completed'
    })
    
  } catch (error) {
    console.error('Form debug error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Form debug failed'
      },
      { status: 500 }
    )
  }
}
