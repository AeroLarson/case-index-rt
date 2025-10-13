'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useCustomization } from '@/contexts/CustomizationContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function AccountPage() {
  const { user, logout, userProfile } = useAuth()
  const { settings, updateSettings } = useCustomization()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSavedNotification, setShowSavedNotification] = useState(false)

  const handleCustomizationChange = (newSettings: any) => {
    updateSettings(newSettings)
    setShowSavedNotification(true)
    setTimeout(() => setShowSavedNotification(false), 2000)
  }
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

  const handleDeleteAccount = async () => {
    if (!user) return
    
    // Cancel subscription if user has one
    if (userProfile?.plan === 'pro' || userProfile?.plan === 'team') {
      // In a real app, this would call your backend to cancel the Stripe subscription
      console.log('Cancelling subscription for user:', user.id)
      // await fetch('/api/stripe/cancel-subscription', { method: 'POST', body: JSON.stringify({ userId: user.id }) })
    }
    
    // Clear all user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`user_profile_${user.id}`)
    }
    
    // Log out and redirect
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
      {/* Saved Notification Toast */}
      {showSavedNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slideInRight">
          <div className="apple-card p-4 bg-green-500/20 border-green-500/50 flex items-center gap-3">
            <i className="fa-solid fa-check-circle text-green-400 text-xl"></i>
            <div>
              <p className="text-white font-semibold">Settings Saved!</p>
              <p className="text-green-300 text-sm">Changes applied successfully</p>
            </div>
          </div>
        </div>
      )}

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
                <button
                  onClick={() => setActiveTab('customization')}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 ${
                    activeTab === 'customization' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-palette mr-3"></i>
                  Customization
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

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Date Format</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                      <option value="mm/dd/yyyy">MM/DD/YYYY (US)</option>
                      <option value="dd/mm/yyyy">DD/MM/YYYY (International)</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD (ISO)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Customization Tab */}
            {activeTab === 'customization' && (
              <div className="apple-card p-8">
                <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">
                  <i className="fa-solid fa-palette text-purple-400 mr-2"></i>
                  Customization
                </h2>
                <p className="text-gray-300 mb-8">Personalize your Case Index RT experience</p>

                <div className="space-y-8">
                  {/* Theme Selection */}
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-moon text-blue-400"></i>
                      Theme
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => handleCustomizationChange({ theme: 'dark' })}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          settings.theme === 'dark' 
                            ? 'border-blue-500 bg-blue-500/20' 
                            : 'border-slate-600 bg-slate-800/20 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg mb-3"></div>
                        <p className="text-white font-medium text-sm">Dark</p>
                        {settings.theme === 'dark' && (
                          <p className="text-blue-400 text-xs mt-1">
                            <i className="fa-solid fa-check"></i> Active
                          </p>
                        )}
                      </button>
                      <button 
                        onClick={() => handleCustomizationChange({ theme: 'light' })}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          settings.theme === 'light' 
                            ? 'border-blue-500 bg-blue-500/20' 
                            : 'border-slate-600 bg-slate-800/20 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-br from-gray-100 to-white rounded-lg mb-3 border border-gray-300"></div>
                        <p className="text-white font-medium text-sm">Light</p>
                        {settings.theme === 'light' && (
                          <p className="text-blue-400 text-xs mt-1">
                            <i className="fa-solid fa-check"></i> Active
                          </p>
                        )}
                      </button>
                      <button 
                        onClick={() => handleCustomizationChange({ theme: 'auto' })}
                        className={`p-6 border-2 rounded-xl transition-all ${
                          settings.theme === 'auto' 
                            ? 'border-blue-500 bg-blue-500/20' 
                            : 'border-slate-600 bg-slate-800/20 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="w-full h-16 bg-gradient-to-r from-slate-900 via-gray-300 to-white rounded-lg mb-3"></div>
                        <p className="text-white font-medium text-sm">Auto</p>
                        {settings.theme === 'auto' && (
                          <p className="text-blue-400 text-xs mt-1">
                            <i className="fa-solid fa-check"></i> Active
                          </p>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-droplet text-purple-400"></i>
                      Accent Color
                    </h3>
                    <div className="grid grid-cols-6 gap-3">
                      {[
                        { name: 'blue-purple', gradient: 'from-blue-500 to-purple-600' },
                        { name: 'green-emerald', gradient: 'from-green-500 to-emerald-600' },
                        { name: 'orange-red', gradient: 'from-orange-500 to-red-600' },
                        { name: 'pink-rose', gradient: 'from-pink-500 to-rose-600' },
                        { name: 'cyan-blue', gradient: 'from-cyan-500 to-blue-600' },
                        { name: 'indigo-purple', gradient: 'from-indigo-500 to-purple-600' },
                      ].map((color) => (
                        <button
                          key={color.name}
                          onClick={() => handleCustomizationChange({ accentColor: color.name })}
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.gradient} border-2 hover:scale-110 transition-all ${
                            settings.accentColor === color.name ? 'border-white shadow-lg' : 'border-transparent'
                          }`}
                        >
                          {settings.accentColor === color.name && (
                            <i className="fa-solid fa-check text-white"></i>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display Density */}
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-expand text-cyan-400"></i>
                      Display Density
                    </h3>
                    <div className="space-y-3">
                      {(['compact', 'comfortable', 'spacious'] as const).map((density) => (
                        <button
                          key={density}
                          onClick={() => handleCustomizationChange({ displayDensity: density })}
                          className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
                            settings.displayDensity === density
                              ? 'border-blue-500 bg-blue-500/20 hover:bg-blue-500/30'
                              : 'border-slate-600 bg-slate-800/20 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium capitalize">{density}</p>
                              <p className={settings.displayDensity === density ? 'text-blue-400 text-sm' : 'text-gray-400 text-sm'}>
                                {settings.displayDensity === density && <><i className="fa-solid fa-check mr-1"></i> Active - </>}
                                {density === 'compact' && 'More content, less spacing'}
                                {density === 'comfortable' && 'Balanced spacing'}
                                {density === 'spacious' && 'Maximum breathing room'}
                              </p>
                            </div>
                            <div className={`flex ${density === 'compact' ? 'gap-1' : density === 'comfortable' ? 'gap-2' : 'gap-3'}`}>
                              <div className={`w-2 h-8 rounded ${settings.displayDensity === density ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                              <div className={`w-2 h-8 rounded ${settings.displayDensity === density ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                              <div className={`w-2 h-8 rounded ${settings.displayDensity === density ? 'bg-blue-400' : 'bg-gray-500'}`}></div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-grip text-green-400"></i>
                      Dashboard Layout
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border-2 border-blue-500 bg-blue-500/20 rounded-xl hover:bg-blue-500/30 transition-all">
                        <div className="grid grid-cols-3 gap-1 mb-3">
                          <div className="h-8 bg-blue-400/50 rounded col-span-2"></div>
                          <div className="h-8 bg-blue-400/50 rounded"></div>
                          <div className="h-6 bg-blue-400/30 rounded col-span-3"></div>
                        </div>
                        <p className="text-white font-medium text-sm">Default</p>
                        <p className="text-blue-400 text-xs">
                          <i className="fa-solid fa-check mr-1"></i>
                          Active
                        </p>
                      </button>
                      <button className="p-4 border-2 border-slate-600 bg-slate-800/20 rounded-xl hover:bg-slate-800/40 transition-all">
                        <div className="grid grid-cols-2 gap-1 mb-3">
                          <div className="h-8 bg-gray-500/50 rounded"></div>
                          <div className="h-8 bg-gray-500/50 rounded"></div>
                          <div className="h-6 bg-gray-500/30 rounded col-span-2"></div>
                        </div>
                        <p className="text-gray-300 font-medium text-sm">Grid</p>
                        <p className="text-gray-500 text-xs">Coming Soon</p>
                      </button>
                    </div>
                  </div>

                  {/* Animations */}
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-sparkles text-yellow-400"></i>
                      Animations & Effects
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">Page Transitions</h4>
                          <p className="text-gray-400 text-sm">Smooth animations between pages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.animations.pageTransitions}
                            onChange={(e) => handleCustomizationChange({ 
                              animations: { ...settings.animations, pageTransitions: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">Particle Effects</h4>
                          <p className="text-gray-400 text-sm">Floating particles on backgrounds</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.animations.particleEffects}
                            onChange={(e) => handleCustomizationChange({ 
                              animations: { ...settings.animations, particleEffects: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">Hover Effects</h4>
                          <p className="text-gray-400 text-sm">Card lifts and glows on hover</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.animations.hoverEffects}
                            onChange={(e) => handleCustomizationChange({ 
                              animations: { ...settings.animations, hoverEffects: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-white font-medium">Reduce Motion</h4>
                          <p className="text-gray-400 text-sm">Minimize animations for accessibility</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={settings.animations.reduceMotion}
                            onChange={(e) => handleCustomizationChange({ 
                              animations: { ...settings.animations, reduceMotion: e.target.checked }
                            })}
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Info Banner */}
                  <div className="pt-6 border-t border-slate-700">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-check-circle text-green-400 text-xl"></i>
                        <div>
                          <p className="text-green-300 font-medium">Changes Saved Automatically</p>
                          <p className="text-green-400/70 text-sm">Your customization preferences are applied instantly</p>
                        </div>
                      </div>
                    </div>
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
              <div className="pb-4 border-b border-red-500/20">
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 w-full sm:w-auto"
                >
                  <i className="fa-solid fa-sign-out-alt mr-2"></i>
                  Sign Out
                </button>
                <p className="text-gray-400 text-sm mt-3">
                  Sign out of your account on this device
                </p>
              </div>
              
              <div>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-6 py-3 rounded-2xl font-medium transition-all duration-200 w-full sm:w-auto"
                >
                  <i className="fa-solid fa-trash mr-2"></i>
                  Delete Account
                </button>
                <p className="text-gray-400 text-sm mt-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="apple-card p-8 max-w-md w-full border-red-500/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-exclamation-triangle text-red-400 text-2xl"></i>
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">Delete Account?</h3>
              <p className="text-gray-400">This action cannot be undone. All your data will be permanently deleted.</p>
            </div>

            {(userProfile?.plan === 'pro' || userProfile?.plan === 'team') && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-info-circle text-yellow-400 mt-1"></i>
                  <div>
                    <p className="text-yellow-400 font-medium mb-1">Active Subscription</p>
                    <p className="text-yellow-300 text-sm">
                      Your {userProfile.plan === 'pro' ? 'Professional' : 'Team'} subscription will be cancelled immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
