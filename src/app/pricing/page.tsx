'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function PricingPage() {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('pro')

  // Get current user plan
  const currentPlan = userProfile?.plan || 'free'
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '1 case per month',
        'Basic case information only',
        'Email notifications',
        'Community support',
        'Limited AI insights'
      ],
      limitations: [
        'No detailed case data',
        'No AI case summaries',
        'No calendar integration',
        'No advanced analytics'
      ],
      cta: !user ? 'Get Started Free' : currentPlan === 'free' ? 'Current Plan' : 'Downgrade to Free',
      popular: false,
      isCurrent: currentPlan === 'free'
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '$99',
      period: 'per month',
      description: 'For individual legal professionals',
      features: [
        'Unlimited case searches',
        'Full case details and documents',
        'AI-powered case summaries',
        'Calendar integration (Google, Outlook)',
        'Advanced analytics and reporting',
        'Priority email support',
        'Real-time notifications',
        'Case timeline visualization'
      ],
      limitations: [],
      cta: !user ? 'Get Professional' : currentPlan === 'pro' ? 'Current Plan' : currentPlan === 'free' ? 'Upgrade to Pro' : 'Downgrade to Pro',
      popular: !user || currentPlan !== 'team',
      isCurrent: currentPlan === 'pro'
    },
    {
      id: 'team',
      name: 'Team',
      price: '$299',
      period: 'per month',
      description: 'For law firms and teams',
      features: [
        'Everything in Professional',
        'Up to 5 team members',
        'Team collaboration tools',
        'Clio CRM integration',
        'Custom reporting',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations'
      ],
      limitations: [],
      cta: !user ? 'Get Team Plan' : currentPlan === 'team' ? 'Current Plan' : 'Upgrade to Team',
      popular: false, // Only show popular for pro when not logged in
      isCurrent: currentPlan === 'team'
    }
  ]

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      // Redirect to login with return URL
      router.push(`/login?returnUrl=/pricing&plan=${planId}`)
      return
    }
    
    // Don't allow action on current plan
    if (planId === currentPlan) {
      return
    }
    
    // User is logged in, proceed with plan selection
    if (planId === 'free') {
      // Downgrade to free
      router.push('/billing?downgrade=true&tab=plans')
    } else {
      // Upgrade to pro or team
      router.push(`/billing?plan=${planId}&tab=plans`)
    }
  }

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '40px 24px'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-purple-300 text-xl max-w-3xl mx-auto">
            Start with our free plan and upgrade as your practice grows. 
            All plans include our core case tracking features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative apple-card p-8 hover-lift transition-all duration-300 ${
                plan.popular 
                  ? 'ring-2 ring-blue-500/50 scale-105' 
                  : 'hover:scale-102'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-white text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-white text-5xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 text-lg">/{plan.period}</span>
                </div>
                <p className="text-purple-300 text-lg">{plan.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <h4 className="text-white font-semibold text-lg mb-4">What's included:</h4>
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <i className="fa-solid fa-check text-green-400 text-sm"></i>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limitations for Free Plan */}
              {plan.limitations.length > 0 && (
                <div className="space-y-3 mb-8">
                  <h4 className="text-red-400 font-semibold text-lg mb-4">Limitations:</h4>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <i className="fa-solid fa-times text-red-400 text-sm"></i>
                      <span className="text-gray-400 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={plan.isCurrent}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  plan.isCurrent
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white hover:scale-105'
                    : plan.id === 'free'
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="apple-card p-8 mb-16">
          <h2 className="text-white text-3xl font-bold text-center mb-8">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white font-semibold py-4">Features</th>
                  <th className="text-center text-white font-semibold py-4">Free</th>
                  <th className="text-center text-white font-semibold py-4">Professional</th>
                  <th className="text-center text-white font-semibold py-4">Team</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="text-gray-300 py-4">Case Searches per Month</td>
                  <td className="text-center text-gray-300 py-4">1</td>
                  <td className="text-center text-green-400 py-4">Unlimited</td>
                  <td className="text-center text-green-400 py-4">Unlimited</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-gray-300 py-4">AI Case Summaries</td>
                  <td className="text-center text-red-400 py-4">❌</td>
                  <td className="text-center text-green-400 py-4">✅</td>
                  <td className="text-center text-green-400 py-4">✅</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-gray-300 py-4">Calendar Integration</td>
                  <td className="text-center text-red-400 py-4">❌</td>
                  <td className="text-center text-green-400 py-4">✅</td>
                  <td className="text-center text-green-400 py-4">✅</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-gray-300 py-4">Clio CRM Integration</td>
                  <td className="text-center text-red-400 py-4">❌</td>
                  <td className="text-center text-red-400 py-4">❌</td>
                  <td className="text-center text-green-400 py-4">✅</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-gray-300 py-4">Team Members</td>
                  <td className="text-center text-gray-300 py-4">1</td>
                  <td className="text-center text-gray-300 py-4">1</td>
                  <td className="text-center text-green-400 py-4">Up to 10</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="text-gray-300 py-4">Support</td>
                  <td className="text-center text-gray-300 py-4">Community</td>
                  <td className="text-center text-gray-300 py-4">Email</td>
                  <td className="text-center text-green-400 py-4">Phone + Email</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="apple-card p-8">
          <h2 className="text-white text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. 
                Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-300">
                Professional plan includes a 14-day free trial. 
                No credit card required to start.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300">
                We accept all major credit cards, PayPal, and bank transfers 
                for annual plans.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time. 
                You'll retain access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
