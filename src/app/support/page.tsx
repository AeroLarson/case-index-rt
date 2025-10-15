'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SupportPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'tickets' | 'create'>('tickets')
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
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
    
    try {
      const userTickets = JSON.parse(localStorage.getItem(`support_tickets_${user?.id}`) || '[]')
      setTickets(userTickets.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (error) {
      console.error('Failed to load user tickets:', error)
      setTickets([])
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newTicket.subject.trim() || !newTicket.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    
    try {
      const ticket = {
        id: `ticket_${Date.now()}`,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        subject: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority,
        category: newTicket.category,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      }

      // Save to user's tickets
      const userTickets = JSON.parse(localStorage.getItem(`support_tickets_${user.id}`) || '[]')
      userTickets.push(ticket)
      localStorage.setItem(`support_tickets_${user.id}`, JSON.stringify(userTickets))

      // Also save to global tickets for tech support to see
      const globalTickets = JSON.parse(localStorage.getItem('support_tickets') || '[]')
      globalTickets.push(ticket)
      localStorage.setItem('support_tickets', JSON.stringify(globalTickets))

      setTickets(userTickets)
      setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' })
      setActiveTab('tickets')
      
      alert('Support ticket created successfully! Our team will respond within 24 hours.')
    } catch (error) {
      console.error('Failed to create ticket:', error)
      alert('Failed to create support ticket. Please try again.')
    } finally {
      setIsLoading(false)
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'high': return 'bg-orange-500/20 text-orange-400'
      case 'urgent': return 'bg-red-500/20 text-red-400'
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
          <p className="text-gray-300">Get help with your account, billing, or technical issues</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
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
        </div>

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="apple-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-white text-xl font-semibold mb-2">{ticket.subject}</h3>
                        <p className="text-gray-400 text-sm mb-3">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            Created: {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">
                            Category: {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {ticket.responses && ticket.responses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h4 className="text-white font-medium mb-3">Responses ({ticket.responses.length})</h4>
                        <div className="space-y-3">
                          {ticket.responses.map((response: any, index: number) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-white font-medium">
                                  {response.from === 'support' ? 'Support Team' : 'You'}
                                </span>
                                <span className="text-gray-400 text-sm">
                                  {new Date(response.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{response.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="apple-card p-8 text-center">
                <i className="fa-solid fa-ticket text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-white text-xl font-semibold mb-2">No support tickets</h3>
                <p className="text-gray-400 mb-6">Create a support ticket to get help with any issues</p>
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

        {/* Create Ticket Tab */}
        {activeTab === 'create' && (
          <div className="apple-card p-8">
            <h2 className="text-white text-2xl font-semibold mb-6">Create Support Ticket</h2>
            
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Please provide detailed information about your issue, including steps to reproduce if it's a bug"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('tickets')}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}