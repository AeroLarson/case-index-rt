'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { userProfileManager } from '@/lib/userProfile'
import ClioIntegration from '@/components/ClioIntegration'

type Notice = {
  type: 'success' | 'error'
  message: string
} | null

export default function AccountPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userProfile, isLoading, refreshProfile, clearAllUserData, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [integrationNotice, setIntegrationNotice] = useState<Notice>(null)
  const [isClioConnected, setIsClioConnected] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?returnUrl=/account')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (user && !userProfile) {
      refreshProfile()
    }
  }, [user, userProfile, refreshProfile])

  useEffect(() => {
    if (!user) return

    const error = searchParams.get('error')
    const success = searchParams.get('success')

    if (success === 'clio_connected') {
      userProfileManager.updateClioTokens(user.id, { connectedAt: new Date().toISOString() })
      setIntegrationNotice({
        type: 'success',
        message: 'Clio connected successfully. Your integration is ready to sync.'
      })
      setActiveTab('integrations')
      router.replace('/account?tab=integrations')
      return
    }

    if (error) {
      const messageMap: Record<string, string> = {
        clio_auth_failed: 'Clio authorization failed. Please try connecting again.',
        no_code: 'Clio did not return an authorization code. Please try again.',
        connection_failed: 'Clio connection could not be verified. Please try again.',
        oauth_callback_failed: 'Clio OAuth callback failed. Please try again.'
      }
      setIntegrationNotice({
        type: 'error',
        message: messageMap[error] || 'Clio connection failed. Please try again.'
      })
      setActiveTab('integrations')
      router.replace('/account?tab=integrations')
    }
  }, [searchParams, user, router])

  useEffect(() => {
    if (!user || typeof window === 'undefined') {
      setIsClioConnected(false)
      return
    }
    const tokens = userProfileManager.getClioTokens(user.id)
    setIsClioConnected(!!tokens)
  }, [user, integrationNotice])

  const planLabel = useMemo(() => {
    if (!userProfile) return 'Free'
    return userProfile.plan === 'free' ? 'Free' : userProfile.plan === 'pro' ? 'Professional' : 'Team'
  }, [userProfile])

  const planDescription = useMemo(() => {
    if (!userProfile) return '1 case per month • Basic case information only'
    return userProfile.plan === 'free'
      ? '1 case per month • Basic case information only'
      : userProfile.plan === 'pro'
      ? 'Unlimited searches • AI summaries • Calendar integration'
      : 'Everything in Professional • Up to 5 team members • Clio integration'
  }, [userProfile])

  const formatDateTime = (value?: string) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString()
  }

  const handleSignOut = () => {
    logout()
    router.push('/')
  }

  const handleClearData = () => {
    const confirmed = window.confirm('This will clear all locally stored account data. Continue?')
    if (!confirmed) return
    clearAllUserData()
    router.push('/')
  }

  if (isLoading || (user && !userProfile)) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading account...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to sign in...</p>
        </div>
      </main>
    )
  }

  return (
    <main
      id="main-content"
      className="min-h-screen"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '20px 16px 100px'
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-2">Account Settings</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage your profile, integrations, and security preferences.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['profile', 'integrations', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {tab === 'profile' ? 'Profile' : tab === 'integrations' ? 'Integrations' : 'Security'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="apple-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-white text-lg font-semibold mb-2">Account Details</h2>
                  <p className="text-gray-400 text-sm">Your profile information and plan status.</p>
                </div>
                <button
                  onClick={() => router.push('/billing')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Manage Billing
                </button>
              </div>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Name</p>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Plan</p>
                  <p className="text-white font-medium">{planLabel}</p>
                  <p className="text-gray-400 text-xs mt-2">{planDescription}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Monthly Usage</p>
                  <p className="text-white font-medium">
                    {userProfile?.plan === 'free'
                      ? `${userProfile?.monthlyUsage || 0}/${userProfile?.maxMonthlyUsage || 1}`
                      : 'Unlimited'}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">Resets monthly for Free plan users.</p>
                </div>
              </div>
            </div>

            <div className="apple-card p-6">
              <h2 className="text-white text-lg font-semibold mb-4">Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Created</p>
                  <p className="text-white text-sm">{formatDateTime(userProfile?.createdAt)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Last Login</p>
                  <p className="text-white text-sm">{formatDateTime(userProfile?.lastLogin)}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Previous Login</p>
                  <p className="text-white text-sm">{formatDateTime(userProfile?.previousLogin)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {integrationNotice && (
              <div
                className={`apple-card p-4 border ${
                  integrationNotice.type === 'success' ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <i
                    className={`fa-solid ${
                      integrationNotice.type === 'success' ? 'fa-check-circle text-green-400' : 'fa-triangle-exclamation text-red-400'
                    } mt-0.5`}
                  ></i>
                  <p className="text-gray-200 text-sm">{integrationNotice.message}</p>
                </div>
              </div>
            )}

            <div className="apple-card p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-white text-lg font-semibold">Clio CRM</h2>
                  <p className="text-gray-400 text-sm">Connect Clio to sync calendars and case data.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isClioConnected ? 'bg-green-400' : 'bg-gray-500'}`}></span>
                  <span className="text-xs text-gray-300">{isClioConnected ? 'Connected' : 'Not Connected'}</span>
                </div>
              </div>
              <ClioIntegration isConnectedOverride={isClioConnected} />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="apple-card p-6">
              <h2 className="text-white text-lg font-semibold mb-2">Session Controls</h2>
              <p className="text-gray-400 text-sm mb-6">Manage your active session and local data.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSignOut}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Sign Out
                </button>
                <button
                  onClick={handleClearData}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Clear Local Data
                </button>
              </div>
            </div>

            <div className="apple-card p-6 border border-red-500/30 bg-red-500/5">
              <h2 className="text-white text-lg font-semibold mb-2">Danger Zone</h2>
              <p className="text-gray-300 text-sm mb-4">
                Clearing local data removes saved cases, searches, and preferences stored on this device.
              </p>
              <button
                onClick={handleClearData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Delete Local Account Data
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
