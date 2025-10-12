'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function APISetupPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">San Diego Court API Setup</h1>
          <p className="text-gray-300 text-lg">Get access to real-time San Diego Superior Court data</p>
        </div>

        {/* Setup Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="apple-card p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl font-semibold mb-4">Request API Access</h3>
                <p className="text-gray-300 mb-4">
                  Contact the San Diego Superior Court IT department to request API access for your legal practice.
                </p>
                <div className="bg-white/5 rounded-2xl p-6">
                  <h4 className="text-white font-semibold mb-3">Contact Information:</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      <strong className="text-white">Email:</strong> it@sdcounty.ca.gov
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Phone:</strong> (619) 531-3000
                    </p>
                    <p className="text-gray-300">
                      <strong className="text-white">Address:</strong> 1100 Union Street, San Diego, CA 92101
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="apple-card p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl font-semibold mb-4">Complete Application</h3>
                <p className="text-gray-300 mb-4">
                  Fill out the API access application with your firm's information and intended use case.
                </p>
                <div className="bg-white/5 rounded-2xl p-6">
                  <h4 className="text-white font-semibold mb-3">Required Information:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Law firm name and bar number</li>
                    <li>• Attorney license information</li>
                    <li>• Intended use case and data requirements</li>
                    <li>• Security and compliance documentation</li>
                    <li>• Technical contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="apple-card p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl font-semibold mb-4">Receive API Credentials</h3>
                <p className="text-gray-300 mb-4">
                  Once approved, you'll receive your API key and access credentials for the San Diego Court system.
                </p>
                <div className="bg-white/5 rounded-2xl p-6">
                  <h4 className="text-white font-semibold mb-3">What You'll Receive:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• API Key for authentication</li>
                    <li>• Rate limiting information</li>
                    <li>• Documentation and endpoints</li>
                    <li>• Support contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="apple-card p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-2xl font-semibold mb-4">Configure Your Account</h3>
                <p className="text-gray-300 mb-4">
                  Enter your API credentials in the data mining interface to start extracting court data.
                </p>
                <button
                  onClick={() => router.push('/data-mining')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200"
                >
                  <i className="fa-solid fa-cog mr-2"></i>
                  Configure API Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Features */}
        <div className="apple-card p-8 mt-12">
          <h3 className="text-white text-2xl font-semibold mb-6">Available API Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-search text-blue-400"></i>
                <span className="text-white font-medium">Case Search</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-users text-green-400"></i>
                <span className="text-white font-medium">Party Information</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-calendar text-purple-400"></i>
                <span className="text-white font-medium">Hearing Schedules</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-file text-orange-400"></i>
                <span className="text-white font-medium">Document Tracking</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-gavel text-red-400"></i>
                <span className="text-white font-medium">Court Proceedings</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-video text-blue-400"></i>
                <span className="text-white font-medium">Virtual Meeting Links</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-chart-line text-green-400"></i>
                <span className="text-white font-medium">Case Analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-bell text-yellow-400"></i>
                <span className="text-white font-medium">Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rate Limits */}
        <div className="apple-card p-8 mt-8">
          <h3 className="text-white text-2xl font-semibold mb-6">API Rate Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-clock text-white text-2xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">100 Requests</h4>
              <p className="text-gray-400 text-sm">Per minute</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-database text-white text-2xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">10,000 Requests</h4>
              <p className="text-gray-400 text-sm">Per day</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-shield text-white text-2xl"></i>
              </div>
              <h4 className="text-white font-semibold mb-2">Secure</h4>
              <p className="text-gray-400 text-sm">HTTPS only</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="apple-card p-8 mt-8">
          <h3 className="text-white text-2xl font-semibold mb-6">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-semibold mb-3">Technical Support</h4>
              <p className="text-gray-300 text-sm mb-2">
                For technical issues with the API integration:
              </p>
              <p className="text-blue-300 text-sm">support@caseindexrt.com</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Court API Support</h4>
              <p className="text-gray-300 text-sm mb-2">
                For San Diego Court API questions:
              </p>
              <p className="text-blue-300 text-sm">it@sdcounty.ca.gov</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
