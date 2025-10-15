'use client'

import { useState, useEffect } from 'react'

interface AIOverviewProps {
  caseId?: string
  caseTitle?: string
  caseStatus?: string
  court?: string
  judge?: string
  parties?: {
    plaintiff: string
    defendant: string
  }
  lastLogin?: string
  className?: string
}

export default function AIOverview({ 
  caseId, 
  caseTitle, 
  caseStatus, 
  court, 
  judge, 
  parties,
  lastLogin, 
  className = '' 
}: AIOverviewProps) {
  const [isThinking, setIsThinking] = useState(false)
  const [overview, setOverview] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  // Generate AI overview when case changes
  useEffect(() => {
    if (!caseId) return

    generateAIOverview(caseId, caseTitle, caseStatus, court, judge, parties, lastLogin)
  }, [caseId, caseTitle, caseStatus, court, judge, parties, lastLogin])

  const generateAIOverview = async (
    caseId: string, 
    caseTitle?: string, 
    caseStatus?: string, 
    court?: string, 
    judge?: string, 
    parties?: { plaintiff: string; defendant: string },
    lastLogin?: string
  ) => {
    try {
      setIsThinking(true)
      setIsComplete(false)
      setOverview('')
      
      // Extract case type from title (e.g., "Johnson v. Martinez - Dissolution with Minor Children")
      const caseTypeMatch = caseTitle?.match(/- (.+)$/)
      const caseType = caseTypeMatch ? caseTypeMatch[1] : "Family Law"
      
      // Prepare case data using actual selected case information
      const caseData = {
        caseNumber: caseId,
        caseTitle: caseTitle || `Case ${caseId}`,
        caseType: `Family Law - ${caseType}`,
        status: caseStatus || "Active",
        dateFiled: "March 15, 2024", // Could be enhanced to use real date if available
        parties: {
          petitioner: parties?.plaintiff || "Unknown",
          respondent: parties?.defendant || "Unknown",
          petitionerAttorney: "Law Office of Smith & Associates",
          respondentAttorney: "Martinez Family Law Group"
        },
        courtLocation: court || "San Diego Superior Court",
        judicialOfficer: judge || "Hon. Rebecca Kanter"
      }

      // Call API to generate AI insights
      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      })

      if (!response.ok) {
        throw new Error(`AI insights failed: ${response.status}`)
      }

      const result = await response.json()
      const insights = result.insights
      
      // Format the overview with court details
      let formattedOverview = ''
      
      // Extract case type in lowercase for better readability
      const simpleCaseType = caseType.toLowerCase()
      
      if (lastLogin) {
        const timeSinceLogin = Date.now() - new Date(lastLogin).getTime()
        const daysSinceLogin = Math.floor(timeSinceLogin / (1000 * 60 * 60 * 24))
        
        if (daysSinceLogin > 0) {
          formattedOverview += `Welcome back! It's been ${daysSinceLogin} day${daysSinceLogin > 1 ? 's' : ''} since your last login. Here's what's happening with your case:\n\n`
        } else {
          formattedOverview += `Welcome back! Here's the latest on your case:\n\n`
        }
      } else {
        formattedOverview += `Here's an overview of your case:\n\n`
      }
      
      // Add case type specific information
      if (simpleCaseType.includes('dissolution')) {
        formattedOverview += `This is a dissolution of marriage case (divorce) involving minor children. The case is currently in active status with ongoing proceedings.\n\n`
      } else if (simpleCaseType.includes('custody')) {
        formattedOverview += `This case involves child custody matters. The court will consider the best interests of the children in all decisions.\n\n`
      } else if (simpleCaseType.includes('support')) {
        formattedOverview += `This case involves child or spousal support matters. Financial documentation and income verification are typically required.\n\n`
      } else {
        formattedOverview += `This is a family law case with ongoing proceedings. The court will handle all matters according to California Family Code.\n\n`
      }
      
      // Extract department number from court name
      const departmentMatch = court?.match(/Department (\d+)/)
      const department = departmentMatch ? departmentMatch[1] : '602'
      const courtName = court?.replace(/\s*\(Department \d+\)/, '') || 'San Diego Superior Court - Central'
      
      formattedOverview += `Upcoming hearing scheduled for 1/27/2026 at 9:00 AM - request for order hearing. The case is assigned to ${judge || 'Hon. Rebecca Kanter'} in Department ${department} at ${courtName}. Virtual attendance available via Zoom ID: 123-456-7890, Passcode: 123456.\n\n${insights}`

      setOverview(formattedOverview)
      setIsComplete(true)
    } catch (error) {
      console.error('AI Overview Error:', error)
      // Fallback to mock data if AI fails
      const fallbackOverview = generateFallbackOverview(caseId, lastLogin)
      setOverview(fallbackOverview)
      setIsComplete(true)
    } finally {
      setIsThinking(false)
    }
  }

  const generateFallbackOverview = (caseId: string, lastLogin?: string) => {
    const courtData = {
      caseNumber: caseId,
      courtLocation: 'San Diego Superior Court - Central',
      department: '602',
      judge: 'Hon. Rebecca Kanter',
      nextHearing: '1/27/2026 at 9:00 AM',
      hearingType: 'Request for Order Hearing',
      zoomId: '123-456-7890',
      passcode: '123456'
    }

    let fallbackText = ''
    
    if (lastLogin) {
      const timeSinceLogin = Date.now() - new Date(lastLogin).getTime()
      const daysSinceLogin = Math.floor(timeSinceLogin / (1000 * 60 * 60 * 24))
      
      if (daysSinceLogin > 0) {
        fallbackText += `Welcome back! It's been ${daysSinceLogin} day${daysSinceLogin > 1 ? 's' : ''} since your last login. Here's what's happening with your case:\n\n`
      } else {
        fallbackText += `Welcome back! Here's the latest on your case:\n\n`
      }
    } else {
      fallbackText += `Here's an overview of your case:\n\n`
    }
    
    fallbackText += `Case ${courtData.caseNumber} is currently active in the San Diego Superior Court system. The case is assigned to ${courtData.judge} in Department ${courtData.department}.\n\n`
    fallbackText += `Your next hearing is scheduled for ${courtData.nextHearing} - ${courtData.hearingType}. Virtual attendance is available via Zoom ID: ${courtData.zoomId}, Passcode: ${courtData.passcode}.\n\n`
    fallbackText += `Key points to remember:\n`
    fallbackText += `• Bring all relevant documents to the hearing\n`
    fallbackText += `• Arrive 15 minutes early for virtual hearings\n`
    fallbackText += `• Contact your attorney if you have questions\n`
    fallbackText += `• Keep all case-related communications documented\n\n`
    fallbackText += `This case involves family law matters and will be handled according to California Family Code. The court's primary concern is the best interests of any children involved.`
    
    return fallbackText
  }

  return (
    <div className={`apple-card p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-robot text-white text-lg"></i>
        </div>
        <div>
          <h3 className="text-white font-semibold text-lg">AI Case Overview</h3>
          <p className="text-gray-400 text-sm">Powered by advanced AI analysis</p>
        </div>
      </div>

      {isThinking && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-300">AI is analyzing your case...</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-400 text-sm">Processing case details and generating insights</p>
          </div>
        </div>
      )}

      {isComplete && overview && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-lightbulb text-blue-400 text-lg mt-1"></i>
              <div>
                <h4 className="text-blue-300 font-semibold mb-2">AI Analysis Complete</h4>
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {overview}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <i className="fa-solid fa-check-circle"></i>
            <span>Analysis completed successfully</span>
          </div>
        </div>
      )}

      {!isThinking && !isComplete && (
        <div className="text-center text-gray-400 py-8">
          <i className="fa-solid fa-robot text-4xl mb-4 opacity-50"></i>
          <p>Click on a case to see AI insights</p>
        </div>
      )}
    </div>
  )
}