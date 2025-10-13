// Court Data Sync System
// Automatically detects hearings, tentative rulings, and updates calendars

export interface HearingEvent {
  caseNumber: string
  hearingDate: string
  hearingTime: string
  hearingType: string
  judge: string
  department: string
  courthouse: {
    name: string
    address: string
    zipCode: string
  }
  virtualLinks?: {
    zoom?: string
    teams?: string
    phone?: string
  }
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
}

export interface TentativeRuling {
  caseNumber: string
  judge: string
  department: string
  rulingDate: string
  rulingText: string
  rulingType: 'tentative' | 'final'
  courtCounty: string
}

export interface CourtRules {
  county: string
  rulesUrl: string
  rulesPdf: string
  lastUpdated: string
  sections: {
    familyLaw?: string
    probate?: string
    civil?: string
    criminal?: string
  }
}

// County-specific court data configuration
export const COUNTY_CONFIG = {
  'san-diego': {
    name: 'San Diego County',
    courthouse: {
      name: 'San Diego Superior Court',
      address: '1100 Union Street',
      city: 'San Diego',
      zipCode: '92101',
      phone: '(619) 450-7200'
    },
    departments: {
      'FAM-1': 'Family Law Department 1',
      'FAM-2': 'Family Law Department 2',
      'PROB-1': 'Probate Department 1'
    },
    tentativeRulingsUrl: 'https://www.sdcourt.ca.gov/tentative-rulings',
    rulesUrl: 'https://www.sdcourt.ca.gov/local-rules',
    documentOrderingUrl: 'https://www.sdcourt.ca.gov/online-services/document-ordering'
  },
  'sonoma': {
    name: 'Sonoma County',
    courthouse: {
      name: 'Sonoma County Superior Court',
      address: '3055 Cleveland Avenue',
      city: 'Santa Rosa',
      zipCode: '95403',
      phone: '(707) 521-6600'
    },
    departments: {
      'FAM-1': 'Family Law Department 1',
      'FAM-2': 'Family Law Department 2',
      'PROB-1': 'Probate Department 1'
    },
    tentativeRulingsUrl: 'https://www.sonoma.courts.ca.gov/tentative-rulings',
    rulesUrl: 'https://www.sonoma.courts.ca.gov/local-rules',
    documentOrderingUrl: 'https://www.sonoma.courts.ca.gov/online-services/document-ordering'
  }
}

// Main sync function for hearings
export async function syncCourtHearings(userId: string, caseNumbers: string[]): Promise<HearingEvent[]> {
  const hearings: HearingEvent[] = []
  
  for (const caseNumber of caseNumbers) {
    try {
      // Determine county from case number format
      const county = determineCountyFromCaseNumber(caseNumber)
      
      if (county && COUNTY_CONFIG[county]) {
        const countyHearings = await fetchHearingsForCase(caseNumber, county)
        hearings.push(...countyHearings)
      }
    } catch (error) {
      console.error(`Error syncing hearings for case ${caseNumber}:`, error)
    }
  }
  
  return hearings
}

// Fetch tentative rulings for a case
export async function syncTentativeRulings(userId: string, caseNumbers: string[]): Promise<TentativeRuling[]> {
  const rulings: TentativeRuling[] = []
  
  for (const caseNumber of caseNumbers) {
    try {
      const county = determineCountyFromCaseNumber(caseNumber)
      
      if (county && COUNTY_CONFIG[county]) {
        const caseRulings = await fetchTentativeRulingsForCase(caseNumber, county)
        rulings.push(...caseRulings)
      }
    } catch (error) {
      console.error(`Error syncing tentative rulings for case ${caseNumber}:`, error)
    }
  }
  
  return rulings
}

// Determine county from case number format
function determineCountyFromCaseNumber(caseNumber: string): string | null {
  // San Diego: D123456, F123456, etc.
  if (caseNumber.match(/^[A-Z]\d{6}$/)) {
    return 'san-diego'
  }
  
  // Sonoma: 123456, etc.
  if (caseNumber.match(/^\d{6}$/)) {
    return 'sonoma'
  }
  
  return null
}

// Fetch hearings for a specific case (placeholder - would integrate with actual court APIs)
async function fetchHearingsForCase(caseNumber: string, county: string): Promise<HearingEvent[]> {
  // This would integrate with actual court APIs
  // For now, return mock data structure
  return [
    {
      caseNumber,
      hearingDate: '2024-01-15',
      hearingTime: '09:00 AM',
      hearingType: 'Case Management Conference',
      judge: 'Hon. Judge Smith',
      department: 'FAM-1',
      courthouse: COUNTY_CONFIG[county].courthouse,
      virtualLinks: {
        zoom: 'https://zoom.us/j/123456789',
        teams: 'https://teams.microsoft.com/l/meetup-join/123456789'
      },
      status: 'scheduled'
    }
  ]
}

// Fetch tentative rulings for a specific case
async function fetchTentativeRulingsForCase(caseNumber: string, county: string): Promise<TentativeRuling[]> {
  // This would scrape or integrate with court tentative rulings pages
  return [
    {
      caseNumber,
      judge: 'Hon. Judge Smith',
      department: 'FAM-1',
      rulingDate: '2024-01-10',
      rulingText: 'Tentative ruling on motion for...',
      rulingType: 'tentative',
      courtCounty: county
    }
  ]
}

// AI-powered court rules search
export async function searchCourtRules(
  county: string, 
  practiceArea: string, 
  searchQuery: string
): Promise<{
  deadlines: string[]
  rules: string[]
  pageNumbers: number[]
}> {
  // This would use AI to search through court rules PDFs
  return {
    deadlines: [
      'Response to Request for Order: 16 court days',
      'Motion for Domestic Violence Restraining Order: 21 court days'
    ],
    rules: [
      'California Rules of Court, Rule 5.92',
      'Sonoma County Local Rules, Chapter 9, Section 9.1'
    ],
    pageNumbers: [45, 67, 123]
  }
}

// Calendar integration functions
export async function syncToClioCalendar(hearing: HearingEvent, clioTokens: any): Promise<boolean> {
  try {
    // Integrate with Clio calendar API
    const response = await fetch('/api/clio/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${clioTokens.access_token}`
      },
      body: JSON.stringify({
        title: `${hearing.hearingType} - ${hearing.caseNumber}`,
        start: `${hearing.hearingDate}T${hearing.hearingTime}`,
        location: hearing.courthouse.address,
        description: `Judge: ${hearing.judge}\nDepartment: ${hearing.department}\nZoom: ${hearing.virtualLinks?.zoom || 'N/A'}`
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error syncing to Clio calendar:', error)
    return false
  }
}

export async function syncToGoogleCalendar(hearing: HearingEvent, googleTokens: any): Promise<boolean> {
  try {
    // Integrate with Google Calendar API
    const response = await fetch('/api/google/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${googleTokens.access_token}`
      },
      body: JSON.stringify({
        summary: `${hearing.hearingType} - ${hearing.caseNumber}`,
        start: {
          dateTime: `${hearing.hearingDate}T${hearing.hearingTime}`
        },
        location: hearing.courthouse.address,
        description: `Judge: ${hearing.judge}\nDepartment: ${hearing.department}\nZoom: ${hearing.virtualLinks?.zoom || 'N/A'}`
      })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error syncing to Google calendar:', error)
    return false
  }
}
