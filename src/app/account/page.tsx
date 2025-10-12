'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  })

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSave = () => {
    // In a real app, this would save to your backend
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      company: '',
      notifications: {
        email: true,
        push: true,
        sms: false
      }
    })
    setIsEditing(false)
  }

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Account Settings</h1>
          <p className="text-gray-300 text-lg">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="apple-card p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'profile' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-user mr-3"></i>
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'security' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-shield-halved mr-3"></i>
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-bell mr-3"></i>
                  Notifications
                </button>
                <button
                  onClick={() => router.push('/billing')}
                  className="w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 text-gray-300 hover:bg-white/5"
                >
                  <i className="fa-solid fa-credit-card mr-3"></i>
                  Billing
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'preferences' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-gear mr-3"></i>
                  Preferences
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="apple-card p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-white text-2xl font-semibold tracking-tight">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105"
                    >
                      <i className="fa-solid fa-edit mr-2"></i>
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                      >
                        <i className="fa-solid fa-check mr-2"></i>
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white text-lg">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    ) : (
                      <p className="text-white text-lg">{user.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-white text-lg">+1 (555) 123-4567</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Company</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Your Law Firm"
                      />
                    ) : (
                      <p className="text-white text-lg">Smith & Associates</p>
                    )}
                  </div>
                </div>

                {/* Profile Picture */}
                <div className="mt-8">
                  <label className="block text-gray-300 text-sm font-medium mb-4">Profile Picture</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {isEditing && (
                      <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                        <i className="fa-solid fa-camera mr-2"></i>
                        Change Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Password & Security</h2>
                  <div className="space-y-4">
                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-left transition-all duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">Change Password</h3>
                          <p className="text-gray-400 text-sm">Update your account password</p>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                      </div>
                    </button>

                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-left transition-all duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                          <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400 text-sm">Enabled</span>
                          <i className="fa-solid fa-chevron-right text-gray-400"></i>
                        </div>
                      </div>
                    </button>

                    <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-left transition-all duration-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-medium">Login Activity</h3>
                          <p className="text-gray-400 text-sm">View recent login attempts</p>
                        </div>
                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Connected Accounts</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <i className="fa-brands fa-google text-white"></i>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">Google</h3>
                          <p className="text-gray-400 text-sm">Connected</p>
                        </div>
                      </div>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        Disconnect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="apple-card p-8">
                <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">Email Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">Push Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">SMS Notifications</h3>
                      <p className="text-gray-400 text-sm">Receive text message alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Billing Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Card Number</label>
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <p className="text-white">•••• •••• •••• 4242</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Expiry Date</label>
                      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <p className="text-white">12/25</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Current Plan</h2>
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white text-xl font-semibold">Professional Plan</h3>
                        <p className="text-gray-300">$99/month • Billed monthly</p>
                        <p className="text-gray-400 text-sm mt-2">Unlimited cases, advanced analytics, priority support</p>
                      </div>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="apple-card p-8">
                <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Application Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Theme</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Language</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Time Zone</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                      <option value="pst">Pacific Standard Time</option>
                      <option value="est">Eastern Standard Time</option>
                      <option value="cst">Central Standard Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Admin Panel - Only for aero.larson@gmail.com */}
        {user.email === 'aero.larson@gmail.com' && (
          <div className="mt-12">
            <div className="apple-card p-8 border-purple-500/20">
              <h2 className="text-purple-400 text-2xl font-semibold mb-6 tracking-tight">Admin Panel</h2>
              <div className="space-y-6">
                <button 
                  onClick={() => router.push('/admin')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
                >
                  <i className="fa-solid fa-cog mr-2"></i>
                  Access Admin Panel
                </button>
                <p className="text-gray-400 text-sm">
                  System administration, user management, and API configuration
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="mt-12">
          <div className="apple-card p-8 border-red-500/20">
            <h2 className="text-red-400 text-2xl font-semibold mb-6 tracking-tight">Danger Zone</h2>
            <div className="space-y-6">
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                <i className="fa-solid fa-sign-out-alt mr-2"></i>
                Sign Out
              </button>
              <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl font-medium transition-all duration-200">
                <i className="fa-solid fa-trash mr-2"></i>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
