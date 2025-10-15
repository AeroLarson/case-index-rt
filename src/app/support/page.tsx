'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface SupportTicket {
  id: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
  userId: string
  userEmail: string
}

export default function SupportPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'create' | 'tickets'>('create')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    loadUserTickets()
  }, [user, router])

  const loadUserTickets = () => {
    if (typeof window === 'undefined') return
    
    setIsLoading(true)
    try {
      // Load tickets from localStorage
      const allTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]')
      const userTickets = allTickets.filter((ticket: SupportTicket) => ticket.userId === user?.id)
      setTickets(userTickets.sort((a: SupportTicket, b: SupportTicket) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTicket.subject.trim() || !newTicket.description.trim()) return

    setIsSubmitting(true)
    try {
      const ticket: SupportTicket = {
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email || ''
      }

      // Save ticket to localStorage
      const allTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]')
      allTickets.push(ticket)
      localStorage.setItem('support_tickets', JSON.stringify(allTickets))

      // Reset form
      setNewTicket({
        subject: '',
        description: '',
        priority: 'medium'
      })

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Refresh tickets list
      loadUserTickets()
      setActiveTab('tickets')

    } catch (error) {
      console.error('Error submitting ticket:', error)
      alert('Failed to submit ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400'
      case 'high': return 'bg-orange-500/20 text-orange-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400'
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400'
      case 'resolved': return 'bg-green-500/20 text-green-400'
      case 'closed': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">Support Center</h1>
          <p className="text-gray-300">Get help with your Case Index RT account and features</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'create'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Create Ticket
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'tickets'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            My Tickets ({tickets.length})
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-400">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-check-circle"></i>
              <span>Support ticket created successfully! Our team will respond within 24 hours.</span>
            </div>
          </div>
        )}

        {/* Create Ticket Tab */}
        {activeTab === 'create' && (
          <div className="apple-card p-8">
            <h2 className="text-white text-2xl font-semibold mb-6">Create Support Ticket</h2>
            
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Feature request or minor issue</option>
                  <option value="high">High - Important issue affecting usage</option>
                  <option value="urgent">Urgent - Critical issue blocking usage</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-8 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i>
                      Submit Ticket
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setNewTicket({
                      subject: '',
                      description: '',
                      priority: 'medium'
                    })
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Clear Form
                </button>
              </div>
            </form>

            {/* Help Information */}
            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <h3 className="text-blue-300 text-lg font-semibold mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">Common Issues:</h4>
                  <ul className="space-y-1">
                    <li>• Case search not working</li>
                    <li>• Account access problems</li>
                    <li>• Billing and subscription questions</li>
                    <li>• Feature not working as expected</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Response Time:</h4>
                  <ul className="space-y-1">
                    <li>• Urgent: Within 2 hours</li>
                    <li>• High: Within 4 hours</li>
                    <li>• Medium: Within 24 hours</li>
                    <li>• Low: Within 48 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-gray-300 ml-3">Loading tickets...</span>
              </div>
            ) : tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="apple-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-white text-xl font-semibold mb-2">{ticket.subject}</h3>
                        <p className="text-gray-400 text-sm mb-3">
                          Created: {new Date(ticket.createdAt).toLocaleDateString()} at {new Date(ticket.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-gray-300">{ticket.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {ticket.updatedAt !== ticket.createdAt && (
                      <div className="text-sm text-gray-500">
                        Last updated: {new Date(ticket.updatedAt).toLocaleDateString()} at {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="apple-card p-8 text-center">
                <i className="fa-solid fa-ticket text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-white text-xl font-semibold mb-2">No support tickets</h3>
                <p className="text-gray-400 mb-6">You haven't created any support tickets yet.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Create Your First Ticket
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
