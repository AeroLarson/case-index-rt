'use client'

import { useState, useEffect } from 'react'

interface ClioIntegrationProps {
  className?: string
}

interface ClioEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'hearing' | 'deadline' | 'meeting' | 'deposition'
  caseNumber: string
  description: string
  location?: string
}

export default function ClioIntegration({ className = '' }: ClioIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [events, setEvents] = useState<ClioEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock Clio events
  const mockEvents: ClioEvent[] = [
    {
      id: '1',
      title: 'Motion Hearing - Smith v. Johnson',
      date: '2024-03-15',
      time: '09:00 AM',
      type: 'hearing',
      caseNumber: 'FL-2024-001234',
      description: 'Motion for temporary custody hearing',
      location: 'San Diego Superior Court, Room 201'
    },
    {
      id: '2',
      title: 'Discovery Deadline',
      date: '2024-03-20',
      time: '05:00 PM',
      type: 'deadline',
      caseNumber: 'FL-2024-001235',
      description: 'Response to interrogatories due'
    },
    {
      id: '3',
      title: 'Client Meeting - Davis Case',
      date: '2024-03-18',
      time: '02:00 PM',
      type: 'meeting',
      caseNumber: 'FL-2024-001236',
      description: 'Strategy discussion for upcoming trial'
    },
    {
      id: '4',
      title: 'Deposition - Wilson',
      date: '2024-03-22',
      time: '10:00 AM',
      type: 'deposition',
      caseNumber: 'FL-2024-001235',
      description: 'Defendant deposition at law office',
      location: 'Smith & Associates, Conference Room A'
    }
  ]

  const handleConnect = async () => {
    setIsConnecting(true)
    
    // Simulate Clio OAuth connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsConnected(true)
    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    setIsConnected(false)
    setEvents([])
  }

  const handleSyncEvents = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    
    // Simulate API call to sync events
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setEvents(mockEvents)
    setIsLoading(false)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hearing':
        return 'fa-gavel'
      case 'deadline':
        return 'fa-clock'
      case 'meeting':
        return 'fa-users'
      case 'deposition':
        return 'fa-microphone'
      default:
        return 'fa-calendar'
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hearing':
        return 'bg-red-500'
      case 'deadline':
        return 'bg-orange-500'
      case 'meeting':
        return 'bg-blue-500'
      case 'deposition':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className={`apple-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-calendar text-white text-sm"></i>
          </div>
          <h3 className="text-white font-semibold text-lg">Clio Calendar Sync</h3>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 text-green-400">
            <i className="fa-solid fa-check-circle"></i>
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-calendar-plus text-white text-2xl"></i>
          </div>
          <h4 className="text-white text-xl font-semibold mb-2">Connect Your Clio Calendar</h4>
          <p className="text-gray-400 mb-6">
            Sync your case deadlines, hearings, and appointments with your Clio CRM calendar
          </p>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <i className="fa-solid fa-link"></i>
                Connect Clio
              </>
            )}
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-white text-lg font-semibold">Upcoming Events</h4>
            <div className="flex gap-2">
              <button
                onClick={handleSyncEvents}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-sync"></i>
                )}
                Sync
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
              >
                <i className="fa-solid fa-unlink"></i>
              </button>
            </div>
          </div>

          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl">
                  <div className={`w-10 h-10 ${getEventColor(event.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <i className={`fa-solid ${getEventIcon(event.type)} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-medium mb-1 truncate">{event.title}</h5>
                    <p className="text-gray-400 text-sm mb-2">{event.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-calendar"></i>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-clock"></i>
                        {event.time}
                      </span>
                      <span className="text-blue-300">{event.caseNumber}</span>
                    </div>
                    {event.location && (
                      <p className="text-gray-400 text-sm mt-2">
                        <i className="fa-solid fa-map-marker-alt mr-1"></i>
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="fa-solid fa-calendar text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-400">No events found. Click sync to load your Clio calendar.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
        <div className="flex items-start gap-3">
          <i className="fa-solid fa-info-circle text-blue-400 mt-1"></i>
          <div>
            <h5 className="text-blue-300 font-medium mb-1">Clio Integration Benefits</h5>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Automatic sync of case deadlines and hearings</li>
              <li>• Real-time calendar updates</li>
              <li>• Conflict detection and alerts</li>
              <li>• Seamless workflow integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
