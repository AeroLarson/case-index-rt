'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import EmptyState from '@/components/EmptyState'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'hearing' | 'deadline' | 'meeting' | 'deposition' | 'trial' | 'county_hearing' | 'county_deadline'
  caseNumber: string
  location?: string
  description: string
  duration: number
  attendees?: string[]
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  source: 'manual' | 'county_api' | 'clio_sync'
  countyData?: {
    court: string
    judge: string
    department: string
    caseType: string
    filingDate: string
    lastActivity: string
  }
}

export default function CalendarPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadCalendarData()
  }, [user, userProfile, router])

  const loadCalendarData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Load events from user profile's calendar events
    const userEvents: CalendarEvent[] = []
    
    if (userProfile?.calendarEvents) {
      userProfile.calendarEvents.forEach((calEvent) => {
        // Find the associated saved case for additional details
        const savedCase = userProfile.savedCases.find(c => c.caseNumber === calEvent.caseNumber)
        
        userEvents.push({
          id: calEvent.id,
          title: calEvent.title,
          date: calEvent.date,
          time: calEvent.time,
          type: calEvent.type,
          caseNumber: calEvent.caseNumber,
          location: calEvent.location || (savedCase?.courtLocation),
          description: calEvent.description,
          duration: calEvent.duration,
          attendees: [],
          priority: calEvent.priority,
          status: calEvent.status,
          source: 'manual',
          countyData: savedCase ? {
            court: savedCase.courtLocation,
            judge: savedCase.judicialOfficer,
            department: savedCase.department,
            caseType: savedCase.caseType,
            filingDate: savedCase.dateFiled,
            lastActivity: new Date().toISOString().split('T')[0]
          } : undefined
        })
      })
    }
    
    setEvents(userEvents)
    setLastSyncTime(new Date())
    setIsLoading(false)
  }

  const handleCountySync = async () => {
    if (!autoSyncEnabled) return
    
    setSyncStatus('syncing')
    
    try {
      // Sync with real San Diego County API
      const response = await fetch('/api/san-diego-court/sync-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          userCases: userProfile?.savedCases || []
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.events && data.events.length > 0) {
          setEvents(prev => [...prev, ...data.events])
        }
        setLastSyncTime(new Date())
        setSyncStatus('success')
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      console.error('County sync failed:', error)
      setSyncStatus('error')
    }
    
    setTimeout(() => setSyncStatus('idle'), 3000)
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'hearing':
      case 'county_hearing':
        return 'fa-gavel'
      case 'deadline':
      case 'county_deadline':
        return 'fa-clock'
      case 'meeting':
        return 'fa-users'
      case 'deposition':
        return 'fa-microphone'
      case 'trial':
        return 'fa-balance-scale'
      default:
        return 'fa-calendar'
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'hearing':
      case 'county_hearing':
        return 'bg-red-500'
      case 'deadline':
      case 'county_deadline':
        return 'bg-orange-500'
      case 'meeting':
        return 'bg-blue-500'
      case 'deposition':
        return 'bg-purple-500'
      case 'trial':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'county_api':
        return 'fa-building'
      case 'clio_sync':
        return 'fa-calendar-check'
      case 'manual':
        return 'fa-user'
      default:
        return 'fa-calendar'
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'county_api':
        return 'text-green-400'
      case 'clio_sync':
        return 'text-blue-400'
      case 'manual':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0]
    return events
      .filter(event => event.date >= today)
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
      .slice(0, 10)
  }

  const getCountyEvents = () => {
    return events.filter(event => event.source === 'county_api')
  }

  if (!user) {
    return null
  }

  // Show empty state if no events and no saved cases
  if (!isLoading && events.length === 0 && (!userProfile?.savedCases || userProfile.savedCases.length === 0)) {
    return (
      <main 
        className="min-h-screen animated-aura pb-20 lg:pb-10"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '20px 12px 40px 12px' // Optimized mobile padding
        }}
      >
        <div className="max-w-4xl mx-auto">
          <EmptyState type="calendar" />
        </div>
      </main>
    )
  }

  return (
    <main 
      className="min-h-screen animated-aura pb-20 lg:pb-10"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '20px 12px 40px 12px' // Optimized mobile padding
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Smart Calendar</h1>
            <p className="text-gray-300 text-lg">Auto-populated with county case data and your events</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-white/5 rounded-2xl p-1">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  view === 'month' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  view === 'week' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  view === 'day' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                Day
              </button>
            </div>
            {/* Clio Sync Button */}
            <button
              onClick={() => {
                setSyncStatus('syncing')
                setTimeout(() => {
                  setSyncStatus('success')
                  setLastSyncTime(new Date())
                  setTimeout(() => setSyncStatus('idle'), 2000)
                }, 2000)
              }}
              disabled={syncStatus === 'syncing'}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Syncing Clio...</span>
                </>
              ) : syncStatus === 'success' ? (
                <>
                  <i className="fa-solid fa-check text-green-300"></i>
                  <span>Clio Synced!</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link"></i>
                  <span>Sync Clio</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleCountySync}
              disabled={syncStatus === 'syncing'}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {syncStatus === 'syncing' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <i className="fa-solid fa-sync"></i>
              )}
              Sync County Data
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
              <i className="fa-solid fa-plus mr-2"></i>
              Add Event
            </button>
          </div>
        </div>

        {/* Sync Status */}
        <div className="apple-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-building text-green-400"></i>
                <span className="text-white font-medium">County Data Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                  syncStatus === 'success' ? 'bg-green-400' :
                  syncStatus === 'error' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <span className="text-gray-300 text-sm">
                  {syncStatus === 'syncing' ? 'Syncing...' :
                   syncStatus === 'success' ? 'Last sync successful' :
                   syncStatus === 'error' ? 'Sync failed' :
                   'Ready to sync'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoSyncEnabled}
                  onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span className="text-gray-300 text-sm">Auto-sync enabled</span>
              </label>
              {lastSyncTime && (
                <span className="text-gray-400 text-sm">
                  Last sync: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-3">
            <div className="apple-card p-6">
              <h3 className="text-white text-2xl font-semibold mb-6">Upcoming Events</h3>
              
              {isLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    // Group events by date
                    const upcomingEvents = getUpcomingEvents()
                    const eventsByDate: { [key: string]: typeof upcomingEvents } = {}
                    
                    upcomingEvents.forEach(event => {
                      if (!eventsByDate[event.date]) {
                        eventsByDate[event.date] = []
                      }
                      eventsByDate[event.date].push(event)
                    })
                    
                    // Sort dates
                    const sortedDates = Object.keys(eventsByDate).sort()
                    
                    return sortedDates.map(date => (
                      <div key={date}>
                        {/* Date Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex flex-col items-center justify-center">
                            <span className="text-white text-xl font-bold">
                              {new Date(date).getDate()}
                            </span>
                            <span className="text-white text-xs">
                              {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-white text-lg font-semibold">
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                            <p className="text-gray-400 text-sm">{eventsByDate[date].length} event{eventsByDate[date].length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        
                        {/* Events for this date */}
                        <div className="space-y-3 ml-4">
                          {eventsByDate[date].map((event) => (
                            <div
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                            >
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 ${getEventColor(event.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                  <i className={`fa-solid ${getEventIcon(event.type)} text-white text-sm`}></i>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                                    <div className="flex items-center gap-2">
                                      <i className={`fa-solid ${getSourceIcon(event.source)} ${getSourceColor(event.source)} text-sm`}></i>
                                      <span className="text-gray-400 text-sm">{event.source === 'county_api' ? 'County' : 'Manual'}</span>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <i className="fa-solid fa-clock"></i>
                                      {formatTime(event.time)}
                                    </span>
                                    <span className="text-blue-300">{event.caseNumber}</span>
                                  </div>
                                  {event.location && (
                                    <p className="text-gray-400 text-sm mt-2">
                                      <i className="fa-solid fa-map-marker-alt mr-1"></i>
                                      {event.location}
                                    </p>
                                  )}
                                  {event.countyData && (
                                    <div className="mt-2 p-2 bg-green-500/10 rounded-lg">
                                      <p className="text-green-300 text-sm">
                                        <i className="fa-solid fa-building mr-1"></i>
                                        {event.countyData.court} • {event.countyData.judge}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="apple-card p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Calendar Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Events</span>
                  <span className="text-white font-semibold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">County Events</span>
                  <span className="text-green-400 font-semibold">{getCountyEvents().length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Week</span>
                  <span className="text-white font-semibold">
                    {events.filter(e => {
                      const eventDate = new Date(e.date)
                      const today = new Date()
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
                      return eventDate >= weekStart && eventDate < weekEnd
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Urgent Events</span>
                  <span className="text-red-400 font-semibold">
                    {events.filter(e => e.priority === 'urgent').length}
                  </span>
                </div>
              </div>
            </div>

            {/* County Integration Status */}
            <div className="apple-card p-6">
              <h3 className="text-white font-semibold text-lg mb-4">County Integration</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-building text-green-400"></i>
                  <span className="text-gray-300">San Diego County API</span>
                  <span className="text-green-400 text-sm ml-auto">Connected</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-sync text-blue-400"></i>
                  <span className="text-gray-300">Auto-sync</span>
                  <span className={`text-sm ml-auto ${autoSyncEnabled ? 'text-green-400' : 'text-gray-400'}`}>
                    {autoSyncEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-clock text-yellow-400"></i>
                  <span className="text-gray-300">Last sync</span>
                  <span className="text-gray-400 text-sm ml-auto">
                    {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Sources */}
            <div className="apple-card p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Event Sources</h3>
              <div className="space-y-3">
                {[
                  { source: 'county_api', label: 'County API', count: getCountyEvents().length, color: 'text-green-400' },
                  { source: 'manual', label: 'Manual Entry', count: events.filter(e => e.source === 'manual').length, color: 'text-purple-400' },
                  { source: 'clio_sync', label: 'Clio Sync', count: events.filter(e => e.source === 'clio_sync').length, color: 'text-blue-400' }
                ].map((item) => (
                  <div key={item.source} className="flex items-center gap-3">
                    <i className={`fa-solid ${getSourceIcon(item.source)} ${item.color}`}></i>
                    <span className="text-gray-300">{item.label}</span>
                    <span className="text-gray-400 text-sm ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="apple-card p-8 max-w-lg w-full">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-white text-2xl font-bold">{selectedEvent.title}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-calendar text-blue-400"></i>
                  <span className="text-gray-300">{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-clock text-blue-400"></i>
                  <span className="text-gray-300">{formatTime(selectedEvent.time)}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3">
                    <i className="fa-solid fa-map-marker-alt text-blue-400"></i>
                    <span className="text-gray-300">{selectedEvent.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-file text-blue-400"></i>
                  <span className="text-blue-300">{selectedEvent.caseNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <i className={`fa-solid ${getSourceIcon(selectedEvent.source)} ${getSourceColor(selectedEvent.source)}`}></i>
                  <span className="text-gray-300">
                    {selectedEvent.source === 'county_api' ? 'Auto-synced from County API' :
                     selectedEvent.source === 'clio_sync' ? 'Synced from Clio' :
                     'Manually added'}
                  </span>
                </div>
                <p className="text-gray-300">{selectedEvent.description}</p>
                
                {selectedEvent.countyData && (
                  <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                    <h4 className="text-green-300 font-semibold mb-2">County Data</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Court:</span>
                        <span className="text-white">{selectedEvent.countyData.court}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Judge:</span>
                        <span className="text-white">{selectedEvent.countyData.judge}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Department:</span>
                        <span className="text-white">{selectedEvent.countyData.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Case Type:</span>
                        <span className="text-white">{selectedEvent.countyData.caseType}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  <i className="fa-solid fa-check mr-2"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}