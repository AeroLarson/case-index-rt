'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function BrandingDownloadPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.email !== 'aero.larson@gmail.com')) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user || user.email !== 'aero.larson@gmail.com') {
    return null
  }

  const downloadSVG = () => {
    const svg = `
      <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="400" height="120" fill="#ffffff" rx="16"/>
        <rect x="2" y="2" width="396" height="116" fill="#1a1a2e" rx="14"/>
        
        <!-- Logo Icon -->
        <g transform="translate(20, 30)">
          <!-- Scale Icon -->
          <path d="M16 4 L16 36 L4 36 L4 4 Z" fill="#4f46e5" stroke="#6366f1" stroke-width="2"/>
          <path d="M16 4 L28 4 L28 36 L16 36 Z" fill="#7c3aed" stroke="#8b5cf6" stroke-width="2"/>
          <path d="M28 4 L40 4 L40 36 L28 36 Z" fill="#dc2626" stroke="#ef4444" stroke-width="2"/>
          
          <!-- Justice Symbol -->
          <circle cx="22" cy="20" r="6" fill="none" stroke="#ffffff" stroke-width="3"/>
          <path d="M18 20 L26 20" stroke="#ffffff" stroke-width="3"/>
          <path d="M22 16 L22 24" stroke="#ffffff" stroke-width="3"/>
        </g>
        
        <!-- Text -->
        <text x="80" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">
          Case Index RT
        </text>
        <text x="80" y="80" font-family="Arial, sans-serif" font-size="20" fill="#a1a1aa">
          Revolutionary Legal Workflow Automation
        </text>
      </svg>
    `
    
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'case-index-rt-logo.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadBrandingGuide = () => {
    const content = `# Case Index RT Branding Guide

## Company Information
- **Name:** Case Index RT
- **Tagline:** Revolutionary Legal Workflow Automation
- **Description:** Advanced case tracking, AI-powered analysis, and automated court integrations for modern law firms.
- **Website:** https://caseindexrt.com
- **Industry:** Legal Technology / SaaS

## Logo Usage
The logo should be used on a white or light background for best visibility. Maintain minimum clear space of 20px around the logo.

## Brand Colors
- **Primary:** #4f46e5 (Indigo) - Use for buttons, CTAs, and primary elements
- **Secondary:** #7c3aed (Purple) - Use for highlights and accents
- **Accent:** #dc2626 (Red) - Use for alerts and important elements
- **Background:** #1a1a2e (Dark Blue) - Use for dark sections
- **Text:** #ffffff (White) - Use for text on dark backgrounds

## Typography
- **Primary Font:** Inter, system-ui, sans-serif
- **Secondary Font:** Arial, sans-serif

## Stripe Integration Guidelines
1. Use the logo on a white background for Stripe checkout pages
2. Maintain brand consistency across all payment touchpoints
3. Use primary color (#4f46e5) for payment buttons
4. Include company description in Stripe product descriptions
5. Ensure logo is high resolution (minimum 200x60px)

## Contact Information
- **Support:** support@caseindexrt.com
- **Privacy Policy:** https://caseindexrt.com/privacy
- **Terms of Service:** https://caseindexrt.com/terms

## Stripe Configuration
\`\`\`json
{
  "company": {
    "name": "Case Index RT",
    "description": "Revolutionary Legal Workflow Automation",
    "website": "https://caseindexrt.com",
    "support_email": "support@caseindexrt.com",
    "privacy_policy": "https://caseindexrt.com/privacy",
    "terms_of_service": "https://caseindexrt.com/terms"
  },
  "branding": {
    "primary_color": "#4f46e5",
    "secondary_color": "#7c3aed",
    "accent_color": "#dc2626",
    "logo_url": "https://caseindexrt.com/logo.svg"
  },
  "products": {
    "professional": {
      "name": "Case Index RT Professional",
      "description": "Unlimited case searches, AI-powered summaries, calendar integration",
      "price": 99,
      "currency": "usd",
      "interval": "month"
    },
    "team": {
      "name": "Case Index RT Team",
      "description": "Everything in Professional + team features, Clio integration",
      "price": 299,
      "currency": "usd",
      "interval": "month"
    }
  }
}
\`\`\`
`
    
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'case-index-rt-branding-guide.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadStripeConfig = () => {
    const config = {
      company: {
        name: "Case Index RT",
        description: "Revolutionary Legal Workflow Automation",
        website: "https://caseindexrt.com",
        support_email: "support@caseindexrt.com",
        privacy_policy: "https://caseindexrt.com/privacy",
        terms_of_service: "https://caseindexrt.com/terms"
      },
      branding: {
        primary_color: "#4f46e5",
        secondary_color: "#7c3aed",
        accent_color: "#dc2626",
        logo_url: "https://caseindexrt.com/logo.svg"
      },
      products: {
        professional: {
          name: "Case Index RT Professional",
          description: "Unlimited case searches, AI-powered summaries, calendar integration",
          price: 99,
          currency: "usd",
          interval: "month"
        },
        team: {
          name: "Case Index RT Team",
          description: "Everything in Professional + team features, Clio integration",
          price: 299,
          currency: "usd",
          interval: "month"
        }
      }
    }
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'case-index-rt-stripe-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
              <h1 className="text-4xl font-bold mb-4">Case Index RT Branding</h1>
              <p className="text-xl opacity-90">Download logos and branding materials for Stripe integration</p>
            </div>

            {/* Logo Preview */}
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-6">Logo Preview</h2>
                <div className="bg-gray-50 p-8 rounded-lg inline-block">
                  <svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
                    <rect width="400" height="120" fill="#ffffff" rx="16"/>
                    <rect x="2" y="2" width="396" height="116" fill="#1a1a2e" rx="14"/>
                    
                    <g transform="translate(20, 30)">
                      <path d="M16 4 L16 36 L4 36 L4 4 Z" fill="#4f46e5" stroke="#6366f1" stroke-width="2"/>
                      <path d="M16 4 L28 4 L28 36 L16 36 Z" fill="#7c3aed" stroke="#8b5cf6" stroke-width="2"/>
                      <path d="M28 4 L40 4 L40 36 L28 36 Z" fill="#dc2626" stroke="#ef4444" stroke-width="2"/>
                      
                      <circle cx="22" cy="20" r="6" fill="none" stroke="#ffffff" stroke-width="3"/>
                      <path d="M18 20 L26 20" stroke="#ffffff" stroke-width="3"/>
                      <path d="M22 16 L22 24" stroke="#ffffff" stroke-width="3"/>
                    </g>
                    
                    <text x="80" y="50" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">
                      Case Index RT
                    </text>
                    <text x="80" y="80" font-family="Arial, sans-serif" font-size="20" fill="#a1a1aa">
                      Revolutionary Legal Workflow Automation
                    </text>
                  </svg>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={downloadSVG}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Download Logo (SVG)
                </button>
                
                <button
                  onClick={downloadBrandingGuide}
                  className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Download Branding Guide
                </button>
                
                <button
                  onClick={downloadStripeConfig}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Download Stripe Config
                </button>
              </div>

              {/* Brand Information */}
              <div className="mt-12 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Brand Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Company Details</h4>
                    <p><strong>Name:</strong> Case Index RT</p>
                    <p><strong>Tagline:</strong> Revolutionary Legal Workflow Automation</p>
                    <p><strong>Website:</strong> https://caseindexrt.com</p>
                    <p><strong>Industry:</strong> Legal Technology / SaaS</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Brand Colors</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-indigo-600"></div>
                        <span>Primary: #4f46e5 (Indigo)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-purple-600"></div>
                        <span>Secondary: #7c3aed (Purple)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-red-600"></div>
                        <span>Accent: #dc2626 (Red)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
