'use client'

import { useState, useEffect } from 'react'

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  type: 'filing' | 'hearing' | 'motion' | 'deadline' | 'settlement' | 'trial' | 'judgment'
  status: 'completed' | 'pending' | 'upcoming' | 'overdue'
  documents?: string[]
  participants?: string[]
  outcome?: string
  nextAction?: string
}

interface CaseTimelineProps {
  caseNumber: string
  className?: string
}

export default function CaseTimeline({ caseNumber, className = '' }: CaseTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  useEffect(() => {
    loadTimeline()
  }, [caseNumber])

  const loadTimeline = async () => {
    try {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockTimeline: TimelineEvent[] = [
      {
        id: '1',
        date: '2024-01-15',
        title: 'Case Filed',
        description: 'Initial complaint filed with San Diego Superior Court',
        type: 'filing',
        status: 'completed',
        documents: ['Complaint.pdf', 'Civil Case Cover Sheet.pdf'],
        participants: ['Plaintiff Attorney', 'Court Clerk']
      },
      {
        id: '2',
        date: '2024-01-22',
        title: 'Service of Process',
        description: 'Defendant served with summons and complaint',
        type: 'filing',
        status: 'completed',
        documents: ['Proof of Service.pdf', 'Summons.pdf'],
        participants: ['Process Server', 'Defendant']
      },
      {
        id: '3',
        date: '2024-02-15',
        title: 'Defendant Response Due',
        description: 'Deadline for defendant to file answer or demurrer',
        type: 'deadline',
        status: 'completed',
        documents: ['Answer.pdf'],
        participants: ['Defendant Attorney']
      },
      {
        id: '4',
        date: '2024-02-28',
        title: 'Case Management Conference',
        description: 'Initial case management conference scheduled',
        type: 'hearing',
        status: 'completed',
        documents: ['Case Management Statement.pdf'],
        participants: ['Judge Martinez', 'Plaintiff Attorney', 'Defendant Attorney'],
        outcome: 'Discovery plan established, trial date set for June 2024'
      },
      {
        id: '5',
        date: '2024-03-15',
        title: 'Motion for Summary Judgment',
        description: 'Plaintiff files motion for summary judgment',
        type: 'motion',
        status: 'pending',
        documents: ['Motion for Summary Judgment.pdf', 'Memorandum of Points and Authorities.pdf'],
        participants: ['Plaintiff Attorney'],
        nextAction: 'Response due March 29, 2024'
      },
      {
        id: '6',
        date: '2024-03-29',
        title: 'Response to Motion Due',
        description: 'Defendant must file opposition to motion for summary judgment',
        type: 'deadline',
        status: 'upcoming',
        participants: ['Defendant Attorney'],
        nextAction: 'File opposition brief and supporting evidence'
      },
      {
        id: '7',
        date: '2024-04-15',
        title: 'Motion Hearing',
        description: 'Hearing on motion for summary judgment',
        type: 'hearing',
        status: 'upcoming',
        participants: ['Judge Martinez', 'Plaintiff Attorney', 'Defendant Attorney'],
        nextAction: 'Prepare oral arguments and supporting case law'
      },
      {
        id: '8',
        date: '2024-06-10',
        title: 'Jury Trial',
        description: 'Scheduled jury trial commencement',
        type: 'trial',
        status: 'upcoming',
        participants: ['Judge Martinez', 'Jury', 'Plaintiff Attorney', 'Defendant Attorney'],
        nextAction: 'Final trial preparation and witness coordination'
      }
    ]
    
    setTimeline(mockTimeline)
    setIsLoading(false)
    } catch (error) {
      console.error('Timeline loading error:', error)
      setIsLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'filing':
        return 'fa-file-circle-plus'
      case 'hearing':
        return 'fa-gavel'
      case 'motion':
        return 'fa-file-text'
      case 'deadline':
        return 'fa-clock'
      case 'settlement':
        return 'fa-handshake'
      case 'trial':
        return 'fa-balance-scale'
      case 'judgment':
        return 'fa-gavel'
      default:
        return 'fa-circle'
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'filing':
        return 'bg-blue-500'
      case 'hearing':
        return 'bg-red-500'
      case 'motion':
        return 'bg-purple-500'
      case 'deadline':
        return 'bg-orange-500'
      case 'settlement':
        return 'bg-green-500'
      case 'trial':
        return 'bg-yellow-500'
      case 'judgment':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'pending':
        return 'text-yellow-400'
      case 'upcoming':
        return 'text-blue-400'
      case 'overdue':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'fa-check-circle'
      case 'pending':
        return 'fa-clock'
      case 'upcoming':
        return 'fa-calendar'
      case 'overdue':
        return 'fa-exclamation-triangle'
      default:
        return 'fa-circle'
    }
  }

  return (
    <div className={`apple-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-xl font-semibold">Case Timeline</h3>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-clock text-blue-400"></i>
          <span className="text-gray-300 text-sm">{caseNumber}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div
                key={event.id}
                className="relative flex items-start gap-4 cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all duration-200"
                onClick={() => setSelectedEvent(event)}
              >
                {/* Timeline Dot */}
                <div className={`w-8 h-8 ${getEventColor(event.type)} rounded-full flex items-center justify-center flex-shrink-0 z-10 relative`}>
                  <i className={`fa-solid ${getEventIcon(event.type)} text-white text-sm`}></i>
                </div>
                
                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                    <div className="flex items-center gap-2">
                      <i className={`fa-solid ${getStatusIcon(event.status)} ${getStatusColor(event.status)} text-sm`}></i>
                      <span className={`text-sm font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-calendar"></i>
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-tag"></i>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>
                  
                  {event.outcome && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-2">
                      <p className="text-green-300 text-sm">
                        <i className="fa-solid fa-check-circle mr-1"></i>
                        <strong>Outcome:</strong> {event.outcome}
                      </p>
                    </div>
                  )}
                  
                  {event.nextAction && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        <i className="fa-solid fa-arrow-right mr-1"></i>
                        <strong>Next Action:</strong> {event.nextAction}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="apple-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-white text-2xl font-bold">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-calendar text-blue-400"></i>
                <span className="text-gray-300">{new Date(selectedEvent.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <i className={`fa-solid ${getStatusIcon(selectedEvent.status)} ${getStatusColor(selectedEvent.status)}`}></i>
                <span className={`${getStatusColor(selectedEvent.status)} font-medium`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>
              
              <p className="text-gray-300">{selectedEvent.description}</p>
              
              {selectedEvent.documents && selectedEvent.documents.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Related Documents</h4>
                  <div className="space-y-2">
                    {selectedEvent.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <i className="fa-solid fa-file text-blue-400"></i>
                        <span className="text-gray-300">{doc}</span>
                        <button className="text-blue-400 hover:text-blue-300 ml-auto">
                          <i className="fa-solid fa-download"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.participants && selectedEvent.participants.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Participants</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.participants.map((participant, index) => (
                      <span key={index} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.outcome && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-300 font-semibold mb-2">Outcome</h4>
                  <p className="text-gray-300">{selectedEvent.outcome}</p>
                </div>
              )}
              
              {selectedEvent.nextAction && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-blue-300 font-semibold mb-2">Next Action Required</h4>
                  <p className="text-gray-300">{selectedEvent.nextAction}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                Edit Event
              </button>
              <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
