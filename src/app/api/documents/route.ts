import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseNumber = searchParams.get('caseNumber')
    
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, this would query a database
    // For now, we'll return mock documents
    const mockDocuments = [
      {
        id: 'doc-1',
        name: 'Complaint - Initial Filing',
        type: 'pdf',
        size: 2048576, // 2MB
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        caseNumber: caseNumber || 'FL-2024-001234',
        description: 'Initial complaint filed by petitioner',
        isPublic: false,
        tags: ['complaint', 'initial', 'filing']
      },
      {
        id: 'doc-2',
        name: 'Answer to Complaint',
        type: 'pdf',
        size: 1536000, // 1.5MB
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        caseNumber: caseNumber || 'FL-2024-001234',
        description: 'Response filed by respondent',
        isPublic: false,
        tags: ['answer', 'response']
      },
      {
        id: 'doc-3',
        name: 'Motion for Temporary Custody',
        type: 'pdf',
        size: 1024000, // 1MB
        uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        caseNumber: caseNumber || 'FL-2024-001234',
        description: 'Emergency motion for temporary custody',
        isPublic: false,
        tags: ['motion', 'custody', 'emergency']
      }
    ]

    return NextResponse.json({
      success: true,
      documents: mockDocuments,
      total: mockDocuments.length
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
