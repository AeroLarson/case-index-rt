import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { caseNumber } = await request.json()
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authHeader.replace('Bearer ', '')
    
    if (!caseNumber || !caseNumber.trim()) {
      return NextResponse.json({ error: 'Case number is required' }, { status: 400 })
    }

    console.log(`Fetching details for case: ${caseNumber} by user: ${userId}`)

    // TODO: Integrate with actual San Diego County Court API
    
    // Return mock case details for Aero Larson test case
    if (caseNumber.trim().toUpperCase() === 'FL-2024-001234') {
      const caseDetails = {
        caseNumber: 'FL-2024-001234',
        title: 'Larson v. Test Defendant - Dissolution with Minor Children',
        court: 'San Diego Superior Court - Central (Department 602)',
        judge: 'Hon. Rebecca Kanter',
        status: 'Active - Post-Judgment Proceedings',
        lastActivity: 'October 15, 2024',
        parties: {
          plaintiff: 'Aero Larson (Petitioner)',
          defendant: 'Test Defendant (Respondent)'
        },
        documents: 23,
        hearings: 7,
        isDetailed: true,
        detailedInfo: {
          caseNumber: 'FL-2024-001234',
          title: 'Larson v. Test Defendant - Dissolution with Minor Children',
          court: 'San Diego Superior Court - Central (Department 602)',
          judge: 'Hon. Rebecca Kanter',
          status: 'Active - Post-Judgment Proceedings',
          lastActivity: 'October 15, 2024',
          parties: {
            plaintiff: 'Aero Larson (Petitioner)',
            defendant: 'Test Defendant (Respondent)'
          },
          caseHistory: [
            {
              date: '2024-03-15',
              event: 'Case Filed',
              description: 'Initial dissolution petition filed',
              documents: ['Petition for Dissolution', 'Civil Case Cover Sheet']
            },
            {
              date: '2024-03-22',
              event: 'Service of Process',
              description: 'Defendant served with summons and petition',
              documents: ['Proof of Service', 'Summons']
            },
            {
              date: '2024-04-15',
              event: 'Response Filed',
              description: 'Defendant filed response to petition',
              documents: ['Response to Petition', 'Declaration']
            },
            {
              date: '2024-05-20',
              event: 'Case Management Conference',
              description: 'Initial case management conference held',
              documents: ['Case Management Statement'],
              outcome: 'Discovery plan established, mediation scheduled'
            },
            {
              date: '2024-07-10',
              event: 'Mediation',
              description: 'Court-ordered mediation session',
              documents: ['Mediation Report'],
              outcome: 'Partial agreement reached on custody matters'
            },
            {
              date: '2024-09-15',
              event: 'Judgment Entered',
              description: 'Final judgment of dissolution entered',
              documents: ['Judgment of Dissolution', 'Findings and Order']
            }
          ],
          upcomingHearings: [
            {
              date: '2024-11-20',
              time: '9:00 AM',
              type: 'Post-Judgment Hearing',
              location: 'San Diego Superior Court, Room 201',
              virtualMeeting: 'Zoom ID: 123-456-7890, Passcode: 123456'
            }
          ],
          documents: [
            'Petition for Dissolution',
            'Civil Case Cover Sheet',
            'Summons',
            'Proof of Service',
            'Response to Petition',
            'Declaration of Service',
            'Case Management Statement',
            'Mediation Report',
            'Judgment of Dissolution',
            'Findings and Order',
            'Child Custody Agreement',
            'Property Settlement Agreement'
          ],
          parties: {
            plaintiff: {
              name: 'Aero Larson',
              attorney: 'Larson Legal Group',
              contact: 'aero@larsonlegal.com'
            },
            defendant: {
              name: 'Test Defendant',
              attorney: 'Defendant Law Firm',
              contact: 'defendant@lawfirm.com'
            }
          },
          filedDate: '2024-03-15',
          caseType: 'Family Law - Dissolution with Minor Children'
        }
      }
      
      return NextResponse.json({
        success: true,
        caseDetails: caseDetails,
        source: 'test_data'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Case details not found'
      }, { status: 404 })
    }

  } catch (error) {
    console.error('Case details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case details' },
      { status: 500 }
    )
  }
}

