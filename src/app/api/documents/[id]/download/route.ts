import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    // For now, we'll simulate document download with mock data
    // In production, this would fetch from the actual county database
    const mockDocuments = [
      {
        id: '1',
        name: 'Complaint for Divorce.pdf',
        content: 'Mock PDF content for Complaint for Divorce',
        type: 'application/pdf'
      },
      {
        id: '2', 
        name: 'Motion for Temporary Custody.pdf',
        content: 'Mock PDF content for Motion for Temporary Custody',
        type: 'application/pdf'
      },
      {
        id: '3',
        name: 'Response to Complaint.pdf', 
        content: 'Mock PDF content for Response to Complaint',
        type: 'application/pdf'
      }
    ]

    const document = mockDocuments.find(doc => doc.id === documentId)
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Create a mock PDF blob
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${document.content}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`

    // Return the PDF as a blob
    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.name}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}
