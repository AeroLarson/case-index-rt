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
  const { user, userProfile, isLoading: authLoading, refreshProfile } = useAuth()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      loadCalendarData()
    }
  }, [authLoading, user, userProfile, router])

  // Refresh calendar when userProfile changes (new events added)
  useEffect(() => {
    if (userProfile && user) {
      loadCalendarData()
    }
  }, [userProfile?.calendarEvents])

  const loadCalendarData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Load events from user profile's calendar events
    const userEvents: CalendarEvent[] = []
    
    // Load events from user profile's calendar events
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

    // Parse and add events from saved cases
    if (userProfile?.savedCases) {
      userProfile.savedCases.forEach((savedCase) => {
        const caseEvents = parseCaseDates(savedCase)
        userEvents.push(...caseEvents)
      })
    }

    // Add test events for demonstration
    const testEvents: CalendarEvent[] = [
      {
        id: 'test_aero_filing',
        title: 'Case Filed: Larson v. Test Defendant',
        date: '2025-01-05',
        time: '09:00',
        type: 'deadline',
        caseNumber: 'FL-2024-001234',
        location: 'San Diego Superior Court - Central',
        description: 'Family law case filed',
        duration: 60,
        priority: 'medium',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Rebecca Kanter',
          department: 'Department 602',
          caseType: 'Family Law',
          filingDate: '2025-01-05',
          lastActivity: '2025-01-20'
        }
      },
      {
        id: 'test_john_filing',
        title: 'Case Filed: People v. John Doe',
        date: '2025-01-10',
        time: '09:00',
        type: 'deadline',
        caseNumber: 'FL-2024-005678',
        location: 'San Diego Superior Court - Central',
        description: 'Criminal case filed',
        duration: 60,
        priority: 'high',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Michael Rodriguez',
          department: 'Department 703',
          caseType: 'Criminal',
          filingDate: '2025-01-10',
          lastActivity: '2025-01-15'
        }
      },
      {
        id: 'test_aero_hearing',
        title: 'Hearing: Case Management Conference',
        date: '2025-01-15',
        time: '10:00',
        type: 'hearing',
        caseNumber: 'FL-2024-001234',
        location: 'San Diego Superior Court - Central, Room 201',
        description: 'Initial case management conference',
        duration: 60,
        priority: 'high',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Rebecca Kanter',
          department: 'Department 602',
          caseType: 'Family Law',
          filingDate: '2025-01-05',
          lastActivity: '2025-01-20'
        }
      },
      {
        id: 'test_john_hearing',
        title: 'Hearing: Pre-Trial Conference',
        date: '2025-01-25',
        time: '09:00',
        type: 'hearing',
        caseNumber: 'FL-2024-005678',
        location: 'San Diego Superior Court - Central, Department 703',
        description: 'Pre-trial conference for criminal case',
        duration: 60,
        priority: 'urgent',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Michael Rodriguez',
          department: 'Department 703',
          caseType: 'Criminal',
          filingDate: '2025-01-10',
          lastActivity: '2025-01-15'
        }
      },
      // Add events for October 16, 2025
      {
        id: 'test_october_aero_hearing',
        title: 'Hearing: Motion to Modify Custody',
        date: '2025-10-16',
        time: '09:00',
        type: 'hearing',
        caseNumber: 'FL-2024-001234',
        location: 'San Diego Superior Court - Central, Room 201',
        description: 'Motion hearing for custody modification',
        duration: 90,
        priority: 'high',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Rebecca Kanter',
          department: 'Department 602',
          caseType: 'Family Law',
          filingDate: '2025-01-05',
          lastActivity: '2025-01-20'
        }
      },
      {
        id: 'test_october_john_hearing',
        title: 'Hearing: Motion to Suppress Evidence',
        date: '2025-10-16',
        time: '14:00',
        type: 'hearing',
        caseNumber: 'FL-2024-005678',
        location: 'San Diego Superior Court - Central, Department 703',
        description: 'Motion to suppress evidence hearing',
        duration: 120,
        priority: 'urgent',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Michael Rodriguez',
          department: 'Department 703',
          caseType: 'Criminal',
          filingDate: '2025-01-10',
          lastActivity: '2025-01-15'
        }
      },
      {
        id: 'test_october_deadline',
        title: 'Deadline: Response to Discovery',
        date: '2025-10-16',
        time: '17:00',
        type: 'deadline',
        caseNumber: 'FL-2024-001234',
        location: 'San Diego Superior Court - Central',
        description: 'Deadline to respond to discovery requests',
        duration: 30,
        priority: 'urgent',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: 'San Diego Superior Court',
          judge: 'Hon. Rebecca Kanter',
          department: 'Department 602',
          caseType: 'Family Law',
          filingDate: '2025-01-05',
          lastActivity: '2025-01-20'
        }
      }
    ]
    
    userEvents.push(...testEvents)
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
          // Update existing events or add new ones
          setEvents(prev => {
            const updatedEvents = [...prev]
            data.events.forEach((newEvent: CalendarEvent) => {
              const existingIndex = updatedEvents.findIndex(e => e.id === newEvent.id)
              if (existingIndex >= 0) {
                // Update existing event
                updatedEvents[existingIndex] = newEvent
              } else {
                // Add new event
                updatedEvents.push(newEvent)
              }
            })
            return updatedEvents
          })
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

  // Auto-sync every 5 minutes to check for updates
  useEffect(() => {
    if (!autoSyncEnabled || !user) return

    const interval = setInterval(() => {
      handleCountySync()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [autoSyncEnabled, user])

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

  const getEventColor = (type: string, caseNumber?: string) => {
    // Case-specific styling
    if (caseNumber === 'FL-2024-005678') {
      // John Doe criminal case - darker, more serious colors
      switch (type) {
        case 'hearing':
        case 'county_hearing':
          return 'bg-red-600'
        case 'deadline':
        case 'county_deadline':
          return 'bg-red-700'
        case 'meeting':
          return 'bg-red-500'
        case 'deposition':
          return 'bg-red-800'
        case 'trial':
          return 'bg-red-900'
        default:
          return 'bg-red-600'
      }
    } else if (caseNumber === 'FL-2024-001234') {
      // Aero Larson family case - softer, family-friendly colors
      switch (type) {
        case 'hearing':
        case 'county_hearing':
          return 'bg-blue-500'
        case 'deadline':
        case 'county_deadline':
          return 'bg-blue-600'
        case 'meeting':
          return 'bg-blue-400'
        case 'deposition':
          return 'bg-blue-700'
        case 'trial':
          return 'bg-blue-800'
        default:
          return 'bg-blue-500'
      }
    }
    
    // Default styling for other cases
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

  const getEventsForDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  const handleDayClick = (date: Date) => {
    setSelectedDay(date)
    setSelectedEvent(null)
  }

  // Function to parse dates from case details and add to calendar
  const parseCaseDates = (savedCase: any) => {
    const events: CalendarEvent[] = []
    
    // Parse filing date
    if (savedCase.dateFiled) {
      events.push({
        id: `filing_${savedCase.id}`,
        title: `Case Filed: ${savedCase.caseTitle}`,
        date: savedCase.dateFiled,
        time: '09:00',
        type: 'deadline',
        caseNumber: savedCase.caseNumber,
        location: savedCase.courtLocation,
        description: `Case filed on ${savedCase.dateFiled}`,
        duration: 60,
        priority: 'medium',
        status: 'scheduled',
        source: 'county_api',
        countyData: {
          court: savedCase.courtLocation,
          judge: savedCase.judicialOfficer,
          department: savedCase.department,
          caseType: savedCase.caseType,
          filingDate: savedCase.dateFiled,
          lastActivity: new Date().toISOString()
        }
      })
    }

    // Parse hearing dates from case details
    if (savedCase.hearings && Array.isArray(savedCase.hearings)) {
      savedCase.hearings.forEach((hearing: any, index: number) => {
        if (hearing.date) {
          events.push({
            id: `hearing_${savedCase.id}_${index}`,
            title: `Hearing: ${hearing.type || 'Court Hearing'}`,
            date: hearing.date,
            time: hearing.time || '10:00',
            type: 'hearing',
            caseNumber: savedCase.caseNumber,
            location: hearing.location || savedCase.courtLocation,
            description: hearing.description || `Court hearing for ${savedCase.caseTitle}`,
            duration: hearing.duration || 60,
            priority: hearing.priority || 'high',
            status: 'scheduled',
            source: 'county_api',
            countyData: {
              court: savedCase.courtLocation,
              judge: hearing.judge || savedCase.judicialOfficer,
              department: savedCase.department,
              caseType: savedCase.caseType,
              filingDate: savedCase.dateFiled,
              lastActivity: new Date().toISOString()
            }
          })
        }
      })
    }

    // Parse deadline dates
    if (savedCase.deadlines && Array.isArray(savedCase.deadlines)) {
      savedCase.deadlines.forEach((deadline: any, index: number) => {
        if (deadline.date) {
          events.push({
            id: `deadline_${savedCase.id}_${index}`,
            title: `Deadline: ${deadline.type || 'Case Deadline'}`,
            date: deadline.date,
            time: '17:00',
            type: 'deadline',
            caseNumber: savedCase.caseNumber,
            location: savedCase.courtLocation,
            description: deadline.description || `Deadline for ${savedCase.caseTitle}`,
            duration: 30,
            priority: deadline.priority || 'urgent',
            status: 'scheduled',
            source: 'county_api',
            countyData: {
              court: savedCase.courtLocation,
              judge: savedCase.judicialOfficer,
              department: savedCase.department,
              caseType: savedCase.caseType,
              filingDate: savedCase.dateFiled,
              lastActivity: new Date().toISOString()
            }
          })
        }
      })
    }

    return events
  }

  // Calendar view render functions
  const renderMonthView = () => {
    const today = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === current.toDateString()
      })
      
      days.push({
        date: new Date(current),
        events: dayEvents,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === today.toDateString()
      })
      current.setDate(current.getDate() + 1)
    }
    
    return (
      <div className="month-view">
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-gray-400 font-medium text-sm h-12 flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`h-[120px] p-2 rounded-lg border cursor-pointer hover:bg-white/10 transition-colors ${
                day.isCurrentMonth 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white/2 border-white/5'
              } ${day.isToday ? 'ring-2 ring-blue-500' : ''} ${
                selectedDay && day.date.toDateString() === selectedDay.toDateString() 
                  ? 'ring-2 ring-green-500 bg-green-500/10' 
                  : ''
              }`}
              onClick={() => handleDayClick(day.date)}
            >
              <div className={`text-sm font-medium mb-1 ${
                day.isCurrentMonth ? 'text-white' : 'text-gray-500'
              }`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1">
                {day.events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${
                      event.caseNumber === 'FL-2024-005678' 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                        : event.caseNumber === 'FL-2024-001234'
                        ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                        : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderWeekView = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate.toDateString() === day.toDateString()
      })
      
      weekDays.push({
        date: day,
        events: dayEvents,
        isToday: day.toDateString() === today.toDateString()
      })
    }
    
    return (
      <div className="week-view">
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <div key={index} className="h-[500px]">
              <div className={`p-3 rounded-lg mb-3 h-16 flex flex-col justify-center ${
                day.isToday ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5'
              }`}>
                <div className="text-sm font-medium text-white">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-white">
                  {day.date.getDate()}
                </div>
              </div>
              <div className="space-y-2">
                {day.events.map(event => (
                  <div
                    key={event.id}
                    className="p-2 rounded bg-white/5 hover:bg-white/10 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatTime(event.time)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const today = new Date()
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === today.toDateString()
    }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    
    // Generate hours from 6 AM to 10 PM
    const hours = []
    for (let hour = 6; hour <= 22; hour++) {
      hours.push(hour)
    }
    
    return (
      <div className="day-view">
        <div className="mb-6">
          <h4 className="text-2xl font-semibold text-white mb-2">
            {today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          <p className="text-gray-400">
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6">
          <div className="space-y-4">
            {hours.map(hour => {
              const hourEvents = dayEvents.filter(event => {
                const eventHour = parseInt(event.time.split(':')[0])
                return eventHour === hour
              })
              
              return (
                <div key={hour} className="flex items-start gap-4 py-3 border-b border-white/10 last:border-b-0">
                  {/* Time Column */}
                  <div className="w-20 flex-shrink-0">
                    <div className="text-white font-medium text-sm">
                      {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </div>
                  </div>
                  
                  {/* Events Column */}
                  <div className="flex-1 min-h-[40px]">
                    {hourEvents.length === 0 ? (
                      <div className="h-10 flex items-center">
                        <div className="w-full h-px bg-white/10"></div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {hourEvents.map(event => (
                          <div
                            key={event.id}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                              event.caseNumber === 'FL-2024-005678' 
                                ? 'bg-red-500/20 border border-red-500/30 hover:bg-red-500/30' 
                                : event.caseNumber === 'FL-2024-001234'
                                ? 'bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30'
                                : 'bg-white/10 border border-white/20 hover:bg-white/20'
                            }`}
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${getEventColor(event.type, event.caseNumber)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <i className={`fa-solid ${getEventIcon(event.type)} text-white text-xs`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-white font-semibold text-sm truncate">{event.title}</h5>
                                <p className="text-gray-300 text-xs truncate">{event.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400">{event.caseNumber}</span>
                                  {event.location && (
                                    <span className="text-xs text-gray-400 truncate">
                                      <i className="fa-solid fa-map-marker-alt mr-1"></i>
                                      {event.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  event.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                  event.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {event.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
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
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <h1 className="text-white text-4xl font-bold mb-2 tracking-tight">Smart Calendar</h1>
              <p className="text-gray-300 text-lg">Auto-populated with county case data and your events</p>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all duration-200"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <h2 className="text-white text-2xl font-semibold min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-all duration-200"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
              >
                Today
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Controls */}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={loadCalendarData}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              >
                <i className="fa-solid fa-refresh"></i>
                Refresh
              </button>
              
              <button
                onClick={handleCountySync}
                disabled={syncStatus === 'syncing'}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {syncStatus === 'syncing' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-sync"></i>
                )}
                Sync
              </button>
              
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2">
                <i className="fa-solid fa-plus"></i>
                Add Event
              </button>
            </div>
          </div>

          {/* Sync Status */}
          {lastSyncTime && (
            <div className="mt-4 text-sm text-gray-400">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
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
              <h3 className="text-white text-2xl font-semibold mb-6">
                {view === 'month' ? 'Monthly Calendar' : 
                 view === 'week' ? 'Weekly Calendar' : 
                 'Daily Calendar'}
              </h3>
              
              <div className="min-h-[600px]">
                {isLoading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="calendar-container">
                    {view === 'month' && renderMonthView()}
                    {view === 'week' && renderWeekView()}
                    {view === 'day' && renderDayView()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="apple-card p-6 min-h-[200px]">
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
            <div className="apple-card p-6 min-h-[180px]">
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
            <div className="apple-card p-6 min-h-[160px]">
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

        {/* Selected Day Modal */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="apple-card p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white text-2xl font-bold">
                    {selectedDay.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {getEventsForDay(selectedDay).length} event{getEventsForDay(selectedDay).length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa-solid fa-times text-xl"></i>
                </button>
              </div>

              {getEventsForDay(selectedDay).length === 0 ? (
                <div className="text-center py-12">
                  <i className="fa-solid fa-calendar-xmark text-gray-400 text-6xl mb-6"></i>
                  <h4 className="text-white text-xl font-semibold mb-2">No events scheduled</h4>
                  <p className="text-gray-300">This day is free of scheduled events</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Sort events by time */}
                  {getEventsForDay(selectedDay)
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map((event) => (
                    <div
                      key={event.id}
                      className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                        event.caseNumber === 'FL-2024-005678' 
                          ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
                          : event.caseNumber === 'FL-2024-001234'
                          ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        setSelectedEvent(event)
                        setSelectedDay(null)
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${getEventColor(event.type, event.caseNumber)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <i className={`fa-solid ${getEventIcon(event.type)} text-white text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-semibold text-lg">{event.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                              event.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {event.priority}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 text-blue-400">
                                <i className="fa-solid fa-clock"></i>
                                <span className="font-medium">{formatTime(event.time)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 text-blue-400">
                                <i className="fa-solid fa-file"></i>
                                <span className="font-medium">{event.caseNumber}</span>
                              </div>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-3 text-sm md:col-span-2">
                                <div className="flex items-center gap-2 text-blue-400">
                                  <i className="fa-solid fa-map-marker-alt"></i>
                                  <span className="font-medium">{event.location}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
                          
                          {event.countyData && (
                            <div className="mt-4 p-3 bg-white/5 rounded-lg">
                              <h5 className="text-white font-medium text-sm mb-2">Case Details</h5>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                                <div>Court: {event.countyData.court}</div>
                                <div>Judge: {event.countyData.judge}</div>
                                <div>Department: {event.countyData.department}</div>
                                <div>Type: {event.countyData.caseType}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setSelectedDay(null)}
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