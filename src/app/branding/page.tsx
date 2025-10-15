'use client'

import { useState } from 'react'
import { BrandingGenerator } from '@/lib/brandingGenerator'

export default function BrandingPage() {
  const [activeTab, setActiveTab] = useState<'logo' | 'stripe'>('logo')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
              <h1 className="text-4xl font-bold mb-4">Case Index RT Branding</h1>
              <p className="text-xl opacity-90">Download logos, branding guides, and Stripe integration materials</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab('logo')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'logo'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Logo & Branding
                </button>
                <button
                  onClick={() => setActiveTab('stripe')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stripe'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Stripe Integration
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="p-8">
              {activeTab === 'logo' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Logo & Branding Materials</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Logo Preview */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Logo Preview</h3>
                      <div className="bg-white p-4 rounded border">
                        <div dangerouslySetInnerHTML={{ __html: BrandingGenerator.generateLogoHTML() }} />
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Download Options</h3>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            const html = BrandingGenerator.generateLogoHTML()
                            const blob = new Blob([html], { type: 'text/html' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'case-index-rt-branding.html'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Download Branding Guide (HTML)
                        </button>
                        
                        <button
                          onClick={() => {
                            const svg = `
                              <svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                                <rect width="200" height="60" fill="#1a1a2e" rx="8"/>
                                <g transform="translate(10, 10)">
                                  <path d="M8 2 L8 18 L2 18 L2 2 Z" fill="#4f46e5" stroke="#6366f1" stroke-width="1"/>
                                  <path d="M8 2 L14 2 L14 18 L8 18 Z" fill="#7c3aed" stroke="#8b5cf6" stroke-width="1"/>
                                  <path d="M14 2 L20 2 L20 18 L14 18 Z" fill="#dc2626" stroke="#ef4444" stroke-width="1"/>
                                  <circle cx="11" cy="10" r="3" fill="none" stroke="#ffffff" stroke-width="1.5"/>
                                  <path d="M9 10 L13 10" stroke="#ffffff" stroke-width="1.5"/>
                                  <path d="M11 8 L11 12" stroke="#ffffff" stroke-width="1.5"/>
                                </g>
                                <text x="50" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">
                                  Case Index RT
                                </text>
                                <text x="50" y="40" font-family="Arial, sans-serif" font-size="10" fill="#a1a1aa">
                                  Legal Workflow Automation
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
                          }}
                          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Download Logo (SVG)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'stripe' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Stripe Integration Materials</h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Stripe Preview */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Stripe Branding Preview</h3>
                      <div className="bg-white p-4 rounded border">
                        <div dangerouslySetInnerHTML={{ __html: BrandingGenerator.generateStripeBranding() }} />
                      </div>
                    </div>

                    {/* Stripe Download Options */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Stripe Integration Files</h3>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            const html = BrandingGenerator.generateStripeBranding()
                            const blob = new Blob([html], { type: 'text/html' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'case-index-rt-stripe-branding.html'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Download Stripe Branding Guide
                        </button>
                        
                        <button
                          onClick={() => {
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
                          }}
                          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Download Stripe Configuration
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
