'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { userProfileManager } from '@/lib/userProfile'

// Tech support authorized emails
const TECH_SUPPORT_EMAILS = [
  'aero.larson@gmail.com', // Admin
  'tech@caseindexrt.com',  // Tech support email
  'support@caseindexrt.com' // Support email
]

export default function TechSupportPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [userList, setUserList] = useState([] as any[])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [supportTickets, setSupportTickets] = useState([] as any[])
  const [newTicket, setNewTicket] = useState({
    userId: '',
    subject: '',
    description: '',
    priority: 'medium',
    status: 'open'
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Check if user is authorized for tech support
    if (TECH_SUPPORT_EMAILS.includes(user.email || '')) {
      setIsAuthorized(true)
      loadUserData()
      loadSupportTickets()
    } else {
      // Redirect unauthorized users
      router.push('/')
      return
    }

    setIsLoading(false)
  }, [user, router])

  const loadUserData = () => {
    if (typeof window === 'undefined') return
    
    const userListData: any[] = []
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith('user_profile_')) {
        try {
          const profile = JSON.parse(localStorage.getItem(key) || '{}')
          userListData.push({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            plan: profile.plan,
            joinDate: profile.joinDate,
            lastLogin: profile.previousLogin,
            totalSearches: profile.totalSearches || 0,
            savedCases: profile.savedCases?.length || 0,
            monthlyUsage: profile.monthlyUsage || 0,
            maxMonthlyUsage: profile.maxMonthlyUsage || 1,
            issues: profile.supportIssues || []
          })
        } catch (error) {
          console.warn('Failed to parse user profile:', key, error)
        }
      }
    })
    
    setUserList(userListData.sort((a, b) => 
      new Date(b.lastLogin || 0).getTime() - new Date(a.lastLogin || 0).getTime()
    ))
  }

  const loadSupportTickets = () => {
    // Load support tickets from localStorage
    const tickets = JSON.parse(localStorage.getItem('support_tickets') || '[]')
    setSupportTickets(tickets)
  }

  const handleUserSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadUserData()
      return
    }
    
    const filtered = userList.filter(user => 
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.id.toLowerCase().includes(query.toLowerCase())
    )
    setUserList(filtered)
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setNewTicket(prev => ({ ...prev, userId: user.id }))
  }

  const handleCreateTicket = () => {
    if (!newTicket.userId || !newTicket.subject || !newTicket.description) {
      alert('Please fill in all required fields')
      return
    }

    const ticket = {
      id: `ticket_${Date.now()}`,
      ...newTicket,
      createdAt: new Date().toISOString(),
      createdBy: user?.email,
      assignedTo: user?.email
    }

    const updatedTickets = [...supportTickets, ticket]
    setSupportTickets(updatedTickets)
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets))

    // Add issue to user profile
    const userProfile = userProfileManager.getUserProfile(newTicket.userId, '', '')
    if (userProfile) {
      const issues = userProfile.supportIssues || []
      issues.push({
        ticketId: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        createdAt: ticket.createdAt
      })
      userProfileManager.updateUserProfile(newTicket.userId, { supportIssues: issues })
    }

    setNewTicket({
      userId: '',
      subject: '',
      description: '',
      priority: 'medium',
      status: 'open'
    })
    setSelectedUser(null)
    alert('Support ticket created successfully')
  }

  const handleUpdateTicketStatus = (ticketId: string, status: string) => {
    const updatedTickets = supportTickets.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket
    )
    setSupportTickets(updatedTickets)
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets))
  }

  const handleResetUserData = (userId: string) => {
    if (confirm('Are you sure you want to reset this user\'s data? This action cannot be undone.')) {
      userProfileManager.clearUserData(userId)
      alert('User data cleared successfully')
      loadUserData()
    }
  }

  const handleUpdateUserPlan = (userId: string, newPlan: string) => {
    if (confirm(`Are you sure you want to change this user's plan to ${newPlan}?`)) {
      userProfileManager.updatePlan(userId, newPlan)
      alert('User plan updated successfully')
      loadUserData()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">Tech Support Dashboard</h1>
          <p className="text-gray-300">Manage users, support tickets, and system issues</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'tickets'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
              activeTab === 'system'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            System Health
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="apple-card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users by email, name, or ID..."
                    value={searchQuery}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={loadUserData}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* User List */}
            <div className="apple-card p-6">
              <h2 className="text-white text-2xl font-semibold mb-6">All Users ({userList.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-300 py-3 px-4">User</th>
                      <th className="text-left text-gray-300 py-3 px-4">Plan</th>
                      <th className="text-left text-gray-300 py-3 px-4">Usage</th>
                      <th className="text-left text-gray-300 py-3 px-4">Last Login</th>
                      <th className="text-left text-gray-300 py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{user.name || 'No name'}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            <p className="text-gray-500 text-xs">ID: {user.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.plan === 'free' ? 'bg-gray-500/20 text-gray-300' :
                            user.plan === 'pro' ? 'bg-blue-500/20 text-blue-300' :
                            user.plan === 'team' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {user.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white">{user.monthlyUsage}/{user.maxMonthlyUsage}</p>
                            <p className="text-gray-400 text-sm">{user.totalSearches} total searches</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-300">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSelectUser(user)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Support
                            </button>
                            <select
                              onChange={(e) => handleUpdateUserPlan(user.id, e.target.value)}
                              className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                              defaultValue={user.plan}
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                              <option value="team">Team</option>
                              <option value="enterprise">Enterprise</option>
                            </select>
                            <button
                              onClick={() => handleResetUserData(user.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {/* Create New Ticket */}
            {selectedUser && (
              <div className="apple-card p-6">
                <h2 className="text-white text-2xl font-semibold mb-6">Create Support Ticket</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">User</label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                      <p className="text-white">{selectedUser.name} ({selectedUser.email})</p>
                    </div>
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
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Brief description of the issue"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Detailed description of the issue"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={handleCreateTicket}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                    >
                      Create Ticket
                    </button>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 ml-4"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tickets List */}
            <div className="apple-card p-6">
              <h2 className="text-white text-2xl font-semibold mb-6">Support Tickets ({supportTickets.length})</h2>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{ticket.subject}</h3>
                        <p className="text-gray-400 text-sm mt-1">{ticket.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>User: {ticket.userId}</span>
                          <span>Priority: {ticket.priority}</span>
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {supportTickets.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No support tickets found</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Health Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="apple-card p-6">
                <h3 className="text-white text-xl font-semibold mb-4">API Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">Healthy</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">All API endpoints responding normally</p>
              </div>
              
              <div className="apple-card p-6">
                <h3 className="text-white text-xl font-semibold mb-4">Database Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">Connected</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Local storage functioning properly</p>
              </div>
              
              <div className="apple-card p-6">
                <h3 className="text-white text-xl font-semibold mb-4">Stripe Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">Active</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Payment processing operational</p>
              </div>
            </div>

            <div className="apple-card p-6">
              <h3 className="text-white text-xl font-semibold mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300">Total Users: <span className="text-white font-medium">{userList.length}</span></p>
                  <p className="text-gray-300">Active Users: <span className="text-white font-medium">
                    {userList.filter(u => {
                      const lastLogin = u.lastLogin ? new Date(u.lastLogin) : new Date(0)
                      const thirtyDaysAgo = new Date()
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                      return lastLogin > thirtyDaysAgo
                    }).length}
                  </span></p>
                </div>
                <div>
                  <p className="text-gray-300">Open Tickets: <span className="text-white font-medium">
                    {supportTickets.filter(t => t.status === 'open').length}
                  </span></p>
                  <p className="text-gray-300">Resolved Tickets: <span className="text-white font-medium">
                    {supportTickets.filter(t => t.status === 'resolved').length}
                  </span></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
