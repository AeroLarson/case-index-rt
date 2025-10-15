import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { caseNumber: string } }
) {
  try {
    const { caseNumber } = params
    
    if (!caseNumber) {
      return NextResponse.json({ error: 'Case number is required' }, { status: 400 })
    }

    console.log(`Fetching timeline for case: ${caseNumber}`)

    // Return mock timeline data for Aero Larson test case
    if (caseNumber.toUpperCase() === 'FL-2024-001234') {
      const timeline = [
        {
          id: 'event_1',
          date: '2024-03-15',
          title: 'Case Filed',
          description: 'Initial dissolution petition filed with court',
          type: 'filing',
          status: 'completed',
          documents: ['Petition for Dissolution', 'Civil Case Cover Sheet'],
          participants: ['Aero Larson', 'Court Clerk'],
          outcome: 'Case successfully filed and assigned case number'
        },
        {
          id: 'event_2',
          date: '2024-03-22',
          title: 'Service of Process',
          description: 'Defendant served with summons and petition',
          type: 'filing',
          status: 'completed',
          documents: ['Proof of Service', 'Summons'],
          participants: ['Process Server', 'Test Defendant'],
          outcome: 'Defendant successfully served within statutory timeframe'
        },
        {
          id: 'event_3',
          date: '2024-04-15',
          title: 'Response Filed',
          description: 'Defendant filed response to petition',
          type: 'filing',
          status: 'completed',
          documents: ['Response to Petition', 'Declaration'],
          participants: ['Test Defendant', 'Defendant Attorney'],
          outcome: 'Response filed timely, case proceeding to discovery'
        },
        {
          id: 'event_4',
          date: '2024-05-20',
          title: 'Case Management Conference',
          description: 'Initial case management conference held',
          type: 'hearing',
          status: 'completed',
          documents: ['Case Management Statement', 'Conference Minutes'],
          participants: ['Hon. Rebecca Kanter', 'Aero Larson', 'Test Defendant', 'Attorneys'],
          outcome: 'Discovery plan established, mediation scheduled for July'
        },
        {
          id: 'event_5',
          date: '2024-07-10',
          title: 'Mediation Session',
          description: 'Court-ordered mediation session conducted',
          type: 'settlement',
          status: 'completed',
          documents: ['Mediation Report', 'Partial Settlement Agreement'],
          participants: ['Mediator', 'Aero Larson', 'Test Defendant', 'Attorneys'],
          outcome: 'Partial agreement reached on custody matters, property issues remain'
        },
        {
          id: 'event_6',
          date: '2024-09-15',
          title: 'Judgment Entered',
          description: 'Final judgment of dissolution entered by court',
          type: 'judgment',
          status: 'completed',
          documents: ['Judgment of Dissolution', 'Findings and Order'],
          participants: ['Hon. Rebecca Kanter', 'Aero Larson', 'Test Defendant'],
          outcome: 'Marriage dissolved, custody and support orders established'
        },
        {
          id: 'event_7',
          date: '2024-11-20',
          title: 'Post-Judgment Hearing',
          description: 'Scheduled hearing for post-judgment matters',
          type: 'hearing',
          status: 'upcoming',
          documents: ['Notice of Hearing', 'Post-Judgment Motion'],
          participants: ['Hon. Rebecca Kanter', 'Aero Larson', 'Test Defendant'],
          nextAction: 'Prepare for hearing on remaining property division issues'
        }
      ]
      
      return NextResponse.json({
        success: true,
        timeline: timeline,
        source: 'test_data'
      })
    } else {
      return NextResponse.json({
        success: true,
        timeline: [],
        message: 'No timeline data available for this case'
      })
    }

  } catch (error) {
    console.error('Timeline fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
