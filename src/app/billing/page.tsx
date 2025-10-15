'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { userProfileManager } from '@/lib/userProfile'
import { PaymentService } from '@/lib/stripe'
import { PaymentTracker } from '@/lib/paymentTracker'

export default function BillingPage() {
  const { user, userProfile, refreshProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  // Get subscription data from user profile
  const [subscription, setSubscription] = useState({
    plan: 'Free',
    status: 'active',
    nextBilling: null as string | null,
    amount: 0,
    features: ['1 case per month', 'Basic case information only']
  })

  // Update subscription when userProfile changes
  useEffect(() => {
    if (userProfile) {
      const planName = userProfile.plan === 'free' ? 'Free' : userProfile.plan === 'pro' ? 'Professional' : 'Team'
      const amount = userProfile.plan === 'pro' ? 99 : userProfile.plan === 'team' ? 299 : 0
      const features = userProfile.plan === 'free' 
        ? ['1 case per month', 'Basic case information only']
        : userProfile.plan === 'pro'
        ? ['Unlimited case searches', 'AI-powered case summaries', 'Calendar integration']
        : ['Everything in Professional', 'Up to 5 team members', 'Clio CRM integration']
      
      setSubscription({
        plan: planName,
        status: 'active',
        nextBilling: userProfile.plan !== 'free' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        amount,
        features
      })
    }
  }, [userProfile])

  const handleCancelSubscription = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user profile to free plan
      if (user) {
        userProfileManager.updatePlan(user.id, 'free')
        refreshProfile() // Refresh the profile in AuthContext
      }
      
      setSubscription({
        plan: 'Free',
        status: 'cancelled',
        nextBilling: null,
        amount: 0,
        features: ['1 case per month', 'Basic case information only']
      })
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/login?returnUrl=/billing')
      return
    }
    
    // Check for downgrade parameter
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('downgrade') === 'true') {
      handleCancelSubscription()
    }

    // Handle successful Stripe payment
    if (urlParams.get('success') === 'true' && urlParams.get('session_id')) {
      const sessionId = urlParams.get('session_id')
      if (sessionId) {
        handlePaymentSuccess(sessionId)
      }
    }

    // Handle tab parameter from pricing page
    if (urlParams.get('tab') === 'plans') {
      setActiveTab('plans')
    }

  }, [user, router])

  const handlePaymentSuccess = async (sessionId: string) => {
    try {
      const result = await PaymentService.handlePaymentSuccess(sessionId)
      if (result.success && user) {
        // Track the payment
        const planAmount = result.planId === 'pro' ? 99 : 299
        await PaymentTracker.addPaymentRecord({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          planId: result.planId as 'pro' | 'team',
          amount: planAmount,
          status: 'completed',
          stripeSessionId: sessionId,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })

        // Update user profile with new plan
        userProfileManager.updatePlan(user.id, result.planId as 'pro' | 'team')
        refreshProfile()
        
        
        alert('Payment successful! Your plan has been upgraded.')
        // Clean up URL
        window.history.replaceState({}, document.title, '/billing')
      }
    } catch (error) {
      console.error('Payment success handling error:', error)
      alert('Payment verification failed. Please contact support.')
    }
  }



  const handleUpgrade = async (planId: string) => {
    setIsLoading(true)
    
    try {
      // Check if user is admin (exempt from charges)
      const isAdmin = user?.email === 'aero.larson@gmail.com'
      
      if (isAdmin) {
        // Admin can switch plans freely without payment, but still create invoice
        if (user) {
          userProfileManager.updatePlan(user.id, planId as 'pro' | 'team')
          await refreshProfile()
          
          // Create payment record for admin (simulated payment)
          const planAmount = planId === 'pro' ? 99 : 299
          await PaymentTracker.addPaymentRecord({
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            planId: planId as 'pro' | 'team',
            amount: planAmount,
            status: 'completed',
            stripeSessionId: `admin_${Date.now()}`,
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          
        }
        
        const planDetails = {
          'pro': {
            plan: 'Professional',
            amount: 99,
            features: ['Unlimited case searches', 'AI-powered case summaries', 'Calendar integration']
          },
          'team': {
            plan: 'Team',
            amount: 299,
            features: ['Everything in Professional', 'Up to 5 team members', 'Clio CRM integration']
          }
        }
        
        setSubscription({
          ...subscription,
          ...planDetails[planId as keyof typeof planDetails],
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        
        alert('Plan updated successfully! Invoice has been generated. (Admin account - no payment required)')
        setIsLoading(false)
        return
      }
      
      // For regular users, redirect to Stripe checkout
      if (!user) {
        alert('Please log in to upgrade your plan')
        setIsLoading(false)
        return
      }
      
      const session = await PaymentService.createCheckoutSession(
        planId, 
        user.id, 
        user.email
      )
      
      console.log('Payment service response:', session)
      
      if (session.success && session.url) {
        // Redirect to Stripe checkout
        console.log('Redirecting to Stripe checkout:', session.url)
        window.location.href = session.url
      } else if (session.adminExempt) {
        // This shouldn't happen for non-admin users, but handle gracefully
        alert('Admin account detected - no payment required')
        if (user) {
          userProfileManager.updatePlan(user.id, planId as 'pro' | 'team')
          await refreshProfile()
        }
      } else {
        console.error('Checkout session failed:', session)
        alert(`Failed to create checkout session: ${session.error || 'Unknown error'}. Please try again.`)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      
      // Check if it's a 503 error (service unavailable)
      if (error?.message?.includes('503') || error?.status === 503) {
        alert('Payment system is currently unavailable. Please contact support or try again later.')
      } else {
        alert('Payment processing failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '20px 12px 40px 12px'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-white text-2xl md:text-4xl font-bold mb-3 md:mb-4 tracking-tight">Billing & Subscription</h1>
          <p className="text-gray-300 text-sm md:text-lg">Manage your subscription and billing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="apple-card p-4 md:p-6 sticky top-8">
              <nav className="space-y-1 md:space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all duration-200 text-sm md:text-base ${
                    activeTab === 'overview' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-chart-pie mr-2 md:mr-3"></i>
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-2xl transition-all duration-200 text-sm md:text-base ${
                    activeTab === 'plans' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <i className="fa-solid fa-crown mr-2 md:mr-3"></i>
                  Plans
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Current Plan</h2>
                  <div className={`rounded-2xl p-6 ${
                    subscription.plan === 'Free' 
                      ? 'bg-gray-500/10 border border-gray-500/20' 
                      : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white text-xl font-semibold">{subscription.plan} Plan</h3>
                        <p className="text-gray-300">
                          {subscription.amount > 0 ? `$${subscription.amount}/month` : 'Free forever'}
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          {subscription.status === 'active' ? 'Active' : 'Cancelled'}
                        </p>
                        {subscription.nextBilling && (
                          <p className="text-gray-400 text-sm">
                            Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {subscription.plan !== 'Free' && (
                        <button
                          onClick={handleCancelSubscription}
                          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Plan Features</h2>
                  <div className="space-y-3">
                    {subscription.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <i className="fa-solid fa-check text-green-400 text-sm"></i>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Usage This Month</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-search text-white text-2xl" />
                      </div>
                      <p className="text-white text-3xl font-bold">{userProfile?.recentSearches?.length || 0}</p>
                      <p className="text-gray-400 text-sm">Case Searches</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-file text-white text-2xl" />
                      </div>
                      <p className="text-white text-3xl font-bold">{userProfile?.savedCases?.length || 0}</p>
                      <p className="text-gray-400 text-sm">Saved Cases</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-bell text-white text-2xl" />
                      </div>
                      <p className="text-white text-3xl font-bold">{userProfile?.monthlyUsage || 0}</p>
                      <p className="text-gray-400 text-sm">Monthly Usage</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === 'plans' && (
              <div className="space-y-6">
                <div className="apple-card p-8">
                  <h2 className="text-white text-2xl font-semibold mb-6 tracking-tight">Available Plans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <div className="border border-white/10 rounded-2xl p-6">
                      <div className="mb-4">
                        <h3 className="text-white text-lg font-semibold mb-1">Free</h3>
                        <p className="text-gray-400 text-base">$0/month</p>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-300 mb-4">
                        <li>• 1 case search per month</li>
                        <li>• Basic case information</li>
                        <li>• Limited features</li>
                        <li>• Community support</li>
                      </ul>
                      <button
                        onClick={() => handleUpgrade('free')}
                        disabled={isLoading || subscription.plan === 'Free'}
                        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? 'Processing...' : subscription.plan === 'Free' ? 'Current Plan' : 'Downgrade'}
                      </button>
                    </div>

                    <div className="border border-white/10 rounded-2xl p-6">
                      <div className="mb-4">
                        <h3 className="text-white text-lg font-semibold mb-1">Professional</h3>
                        <p className="text-gray-400 text-base">$99/month</p>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-300 mb-4">
                        <li>• Unlimited case searches</li>
                        <li>• AI-powered case summaries</li>
                        <li>• Calendar integration</li>
                        <li>• Advanced analytics</li>
                      </ul>
                      <button
                        onClick={() => handleUpgrade('pro')}
                        disabled={isLoading || subscription.plan === 'Professional'}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? 'Processing...' : subscription.plan === 'Professional' ? 'Current Plan' : 'Upgrade'}
                      </button>
                    </div>

                    <div className="border border-white/10 rounded-2xl p-6">
                      <div className="mb-4">
                        <h3 className="text-white text-lg font-semibold mb-1">Team</h3>
                        <p className="text-gray-400 text-base">$299/month</p>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-300 mb-4">
                        <li>• Everything in Professional</li>
                        <li>• Up to 5 team members</li>
                        <li>• Clio CRM integration</li>
                        <li>• Dedicated support</li>
                      </ul>
                      <button
                        onClick={() => window.location.href = '/contact-sales'}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm"
                      >
                        Contact Sales
                      </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="border border-white/10 rounded-2xl p-6">
                      <div className="mb-4">
                        <h3 className="text-white text-lg font-semibold mb-1">Enterprise</h3>
                        <p className="text-gray-400 text-base">Custom pricing</p>
                      </div>
                      <ul className="space-y-2 text-xs text-gray-300 mb-4">
                        <li>• Everything in Team</li>
                        <li>• Unlimited team members</li>
                        <li>• SSO/SAML, audit logs</li>
                        <li>• Priority support & SLA</li>
                      </ul>
                      <button
                        onClick={() => window.location.href = '/contact-sales'}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm"
                      >
                        Contact Sales
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



          </div>
        </div>
      </div>
    </main>
  )
}
