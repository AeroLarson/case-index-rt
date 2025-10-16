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
    
    // Only return details for specific test cases
    const cleanCaseNumber = caseNumber.trim().toUpperCase()
    if (cleanCaseNumber === 'FL-2024-001234' || cleanCaseNumber === 'FL2024001234' || 
        cleanCaseNumber === 'FL-2024-005678' || cleanCaseNumber === 'FL2024005678') {
      
      let caseDetails
      
      if (cleanCaseNumber === 'FL-2024-005678' || cleanCaseNumber === 'FL2024005678') {
        // John Doe case details
        caseDetails = {
          caseNumber: 'FL-2024-005678',
          title: 'People v. John Doe - Criminal Case',
          court: 'San Diego Superior Court - Central (Department 703)',
          judge: 'Hon. Michael Rodriguez',
          status: 'Active - Pre-Trial Proceedings',
          lastActivity: 'January 15, 2025',
          parties: {
            plaintiff: 'People of the State of California (Prosecution)',
            defendant: 'John Doe (Defendant)'
          },
          documents: 15,
          hearings: 4,
          isDetailed: true,
          detailedInfo: {
            caseNumber: 'FL-2024-005678',
            title: 'People v. John Doe - Criminal Case',
            court: 'San Diego Superior Court - Central (Department 703)',
            judge: 'Hon. Michael Rodriguez',
            status: 'Active - Pre-Trial Proceedings',
            lastActivity: 'January 15, 2025',
            parties: {
              plaintiff: 'People of the State of California (Prosecution)',
              defendant: 'John Doe (Defendant)'
            },
            caseHistory: [
              {
                date: '2025-01-10',
                event: 'Case Filed',
                description: 'Criminal complaint filed against John Doe'
              },
              {
                date: '2025-01-12',
                event: 'Arraignment',
                description: 'Defendant arraigned, plea entered'
              },
              {
                date: '2025-01-14',
                event: 'Pre-Trial Conference',
                description: 'Pre-trial conference scheduled'
              },
              {
                date: '2025-01-15',
                event: 'Motion Hearing',
                description: 'Motion to suppress evidence hearing'
              }
            ],
            upcomingEvents: [
              {
                date: '2025-01-25',
                time: '09:00 AM',
                event: 'Pre-Trial Conference',
                location: 'Department 703, San Diego Superior Court'
              },
              {
                date: '2025-02-15',
                time: '10:00 AM',
                event: 'Trial Setting Conference',
                location: 'Department 703, San Diego Superior Court'
              }
            ],
            documents: [
              { name: 'Criminal Complaint', date: '2025-01-10', type: 'Filing' },
              { name: 'Arraignment Minutes', date: '2025-01-12', type: 'Court Document' },
              { name: 'Motion to Suppress', date: '2025-01-14', type: 'Motion' },
              { name: 'Prosecution Response', date: '2025-01-15', type: 'Response' }
            ]
          }
        }
      } else {
        // Aero Larson case details
        caseDetails = {
          caseNumber: 'FL-2024-001234',
          title: 'Larson v. Test Defendant - Dissolution with Minor Children',
          court: 'San Diego Superior Court - Central (Department 602)',
          judge: 'Hon. Rebecca Kanter',
          status: 'Active - Post-Judgment Proceedings',
          lastActivity: 'January 20, 2025',
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
            lastActivity: 'January 20, 2025',
            parties: {
              plaintiff: 'Aero Larson (Petitioner)',
              defendant: 'Test Defendant (Respondent)'
            },
            caseHistory: [
              {
                date: '2025-01-05',
                event: 'Case Filed',
                description: 'Initial dissolution petition filed',
                documents: ['Petition for Dissolution', 'Civil Case Cover Sheet']
              },
              {
                date: '2025-01-07',
                event: 'Service of Process',
                description: 'Defendant served with summons and petition',
                documents: ['Proof of Service', 'Summons']
              },
              {
                date: '2025-01-10',
                event: 'Response Filed',
                description: 'Defendant filed response to petition',
                documents: ['Response to Petition', 'Declaration']
              },
              {
                date: '2025-01-15',
                event: 'Case Management Conference',
                description: 'Initial case management conference held',
                documents: ['Case Management Statement'],
                outcome: 'Discovery plan established, mediation scheduled'
              },
              {
                date: '2025-01-18',
                event: 'Mediation',
                description: 'Court-ordered mediation session',
                documents: ['Mediation Report'],
                outcome: 'Partial agreement reached on custody matters'
              },
              {
                date: '2025-01-20',
                event: 'Judgment Entered',
                description: 'Final judgment of dissolution entered',
                documents: ['Judgment of Dissolution', 'Findings and Order']
              }
            ],
            upcomingHearings: [
              {
                date: '2025-01-25',
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
            filedDate: '2025-01-05',
            caseType: 'Family Law - Dissolution with Minor Children'
          }
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