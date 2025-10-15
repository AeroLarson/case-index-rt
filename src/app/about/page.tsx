'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function AboutPage() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-white text-5xl font-bold mb-6 tracking-tight">About Case Index RT</h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Revolutionizing legal case management with AI-powered insights, real-time court data, and intelligent automation for modern law practices.
          </p>
        </div>

        {/* Mission Section */}
        <div className="apple-card p-8 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-white text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg mb-6">
                We're transforming how legal professionals manage cases by providing intelligent, 
                automated solutions that save time, reduce errors, and improve outcomes for 
                clients and law firms.
              </p>
              <p className="text-gray-300 text-lg">
                Our platform combines cutting-edge AI technology with comprehensive court data 
                integration to deliver unprecedented insights and efficiency to legal practices.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center">
                <i className="fa-solid fa-gavel text-white text-6xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-white text-3xl font-bold text-center mb-12">Revolutionary Legal Workflow Automation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="apple-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-search text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Universal Case Search</h3>
              <p className="text-gray-300">
                Search by case number (FL-2024-123456) or party names with real-time San Diego County court data integration.
              </p>
            </div>

            <div className="apple-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-calendar text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Auto-Sync Calendar</h3>
              <p className="text-gray-300">
                Automatically sync hearing dates, times, locations, and Zoom links from San Diego County courts to your calendar.
              </p>
            </div>

            <div className="apple-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-robot text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">AI Case Analysis</h3>
              <p className="text-gray-300">
                Get intelligent case summaries, timeline analysis, and court rules search powered by advanced AI.
              </p>
            </div>

            <div className="apple-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-file-download text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Document Management</h3>
              <p className="text-gray-300">
                Download real court documents, auto-download tentative rulings, and manage case files with county integration.
              </p>
            </div>

            <div className="apple-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-building text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Clio CRM Integration</h3>
              <p className="text-gray-300">
                Seamlessly sync with Clio CRM for matters, calendar events, and client data with OAuth 2.0 security.
              </p>
            </div>

            <div className="apple-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-chart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-gray-300">
                Track case trends, monitor deadlines, and get insights with real-time analytics and reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Revolutionary Features */}
        <div className="apple-card p-8 mb-12">
          <h2 className="text-white text-3xl font-bold text-center mb-8">Revolutionary Legal Workflow Features</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Phase 1: Hearing Auto-Sync System</h3>
              <p className="text-gray-300 mb-4">
                Automatically update your calendar with hearing dates, times, locations, judge information, 
                and virtual meeting links directly from San Diego County court systems.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Real-time hearing date synchronization</li>
                <li>• Judge and department information</li>
                <li>• Courthouse address and room details</li>
                <li>• Zoom/Microsoft Teams meeting links</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Phase 2: Tentative Ruling Auto-Download</h3>
              <p className="text-gray-300 mb-4">
                Automatically download tentative rulings from court websites and save them directly 
                to your case document management system.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Instant ruling notifications</li>
                <li>• Automatic document download</li>
                <li>• Case summary integration</li>
                <li>• Document organization and tagging</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Phase 3: AI-Powered Court Rules Search</h3>
              <p className="text-gray-300 mb-4">
                Search through county court rules PDFs with AI to find specific deadlines, 
                procedures, and requirements for different case types.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• Natural language court rules search</li>
                <li>• Deadline identification and tracking</li>
                <li>• Filing requirement analysis</li>
                <li>• County-specific rule guidance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Phase 4: Document Ordering Integration</h3>
              <p className="text-gray-300 mb-4">
                Direct integration with county document ordering systems for seamless 
                document procurement and case file management.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• One-click document ordering</li>
                <li>• County website integration</li>
                <li>• Document tracking and delivery</li>
                <li>• Automated case file updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="apple-card p-8 mb-12">
          <h2 className="text-white text-3xl font-bold text-center mb-8">Built with Modern Technology</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">AI & Machine Learning</h3>
              <p className="text-gray-300 mb-4">
                Our platform leverages advanced AI to provide intelligent case analysis, 
                automated document processing, and smart insights that enhance legal practice efficiency.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• OpenAI integration for case summaries and analysis</li>
                <li>• Natural language processing for court rules search</li>
                <li>• Intelligent case timeline generation</li>
                <li>• Automated document classification and tagging</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-xl font-semibold mb-4">Real-Time Integration</h3>
              <p className="text-gray-300 mb-4">
                Built with Next.js 15, React, and modern web technologies for seamless 
                integration with court systems, CRM platforms, and legal tools.
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• San Diego County Court API integration</li>
                <li>• Clio CRM OAuth 2.0 synchronization</li>
                <li>• Google Calendar and Microsoft Outlook sync</li>
                <li>• Real-time document download and management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="apple-card p-8 mb-12">
          <h2 className="text-white text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-user text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Legal Technology Experts</h3>
              <p className="text-gray-300">
                Our team combines deep legal expertise with cutting-edge technology to deliver 
                solutions that actually work in real legal practice.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-code text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Software Engineers</h3>
              <p className="text-gray-300">
                Top-tier developers with experience in legal tech, AI, and enterprise software 
                building the future of legal practice management.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-heart text-white text-2xl"></i>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Customer Success</h3>
              <p className="text-gray-300">
                Dedicated support team that understands your practice and is committed to 
                helping you succeed with our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="apple-card p-8 mb-12">
          <h2 className="text-white text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-lightbulb text-white text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">Innovation</h3>
              <p className="text-gray-300 text-sm">
                Continuously pushing the boundaries of what's possible in legal technology.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-handshake text-white text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">Trust</h3>
              <p className="text-gray-300 text-sm">
                Building reliable, secure solutions that legal professionals can depend on.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-users text-white text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">Collaboration</h3>
              <p className="text-gray-300 text-sm">
                Working closely with legal professionals to understand and solve real problems.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-rocket text-white text-xl"></i>
              </div>
              <h3 className="text-white font-semibold mb-2">Excellence</h3>
              <p className="text-gray-300 text-sm">
                Committed to delivering the highest quality solutions and support.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="apple-card p-8 text-center">
          <h2 className="text-white text-3xl font-bold mb-4">Ready to Transform Your Legal Practice?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of legal professionals who are already using Case Index RT to streamline 
            their practice and deliver better outcomes for their clients.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/pricing')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200"
            >
              View Pricing Plans
            </button>
            <button
              onClick={() => router.push('/search')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200"
            >
              Try Case Search
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
