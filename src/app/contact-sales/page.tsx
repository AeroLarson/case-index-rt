'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function ContactSalesPage() {
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan') || 'team'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    teamSize: '',
    currentPlan: selectedPlan,
    message: '',
    timeframe: '',
    budget: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would send to your backend/CRM
      const response = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'team':
        return {
          name: 'Team Plan',
          price: '$299/month',
          description: 'Up to 5 team members with advanced features',
          features: ['Everything in Professional', 'Team collaboration', 'Advanced Clio integration', 'Dedicated support']
        }
      case 'enterprise':
        return {
          name: 'Enterprise Plan',
          price: 'Custom pricing',
          description: 'Unlimited team members with enterprise features',
          features: ['Everything in Team', 'Unlimited users', 'Custom integrations', '24/7 support', 'White-label options']
        }
      default:
        return {
          name: 'Custom Solution',
          price: 'Contact us',
          description: 'Tailored pricing for your specific needs',
          features: ['Custom features', 'Flexible pricing', 'Personal consultation']
        }
    }
  }

  const planDetails = getPlanDetails(selectedPlan)

  if (isSubmitted) {
    return (
      <main 
        className="min-h-screen animated-aura flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '40px 24px'
        }}
      >
        <div className="apple-card p-8 max-w-2xl w-full text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-check text-white text-2xl"></i>
          </div>
          <h1 className="text-white text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-gray-300 text-lg mb-6">
            We've received your request and will contact you within 24 hours to discuss your {planDetails.name} needs.
          </p>
          <p className="text-gray-400 mb-8">
            Our sales team will work with you to create a custom solution that fits your law firm's requirements.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </main>
    )
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
          <h1 className="text-white text-4xl font-bold mb-4">Contact Sales</h1>
          <p className="text-purple-300 text-xl">
            Let's discuss your {planDetails.name} needs and create a custom solution for your law firm
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Selected Plan Info */}
          <div className="apple-card p-8">
            <h2 className="text-white text-2xl font-bold mb-6">Selected Plan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white text-xl font-semibold">{planDetails.name}</h3>
                <p className="text-blue-400 text-lg font-medium">{planDetails.price}</p>
                <p className="text-gray-300 mt-2">{planDetails.description}</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {planDetails.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <i className="fa-solid fa-check text-green-400"></i>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="apple-card p-8">
            <h2 className="text-white text-2xl font-bold mb-6">Get Started</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="john@lawfirm.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Company/Firm *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Smith & Associates"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Team Size *</label>
                  <select
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select team size</option>
                    <option value="2-5">2-5 users</option>
                    <option value="6-10">6-10 users</option>
                    <option value="11-25">11-25 users</option>
                    <option value="26-50">26-50 users</option>
                    <option value="50+">50+ users</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Timeline</label>
                  <select
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">When do you need this?</option>
                    <option value="immediately">Immediately</option>
                    <option value="1-month">Within 1 month</option>
                    <option value="3-months">Within 3 months</option>
                    <option value="6-months">Within 6 months</option>
                    <option value="just-exploring">Just exploring options</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Budget Range</label>
                <select
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select budget range</option>
                  <option value="under-500">Under $500/month</option>
                  <option value="500-1000">$500 - $1,000/month</option>
                  <option value="1000-2500">$1,000 - $2,500/month</option>
                  <option value="2500-5000">$2,500 - $5,000/month</option>
                  <option value="5000+">$5,000+/month</option>
                  <option value="discuss">Let's discuss</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Additional Requirements</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Tell us about your specific needs, integrations, or any questions you have..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Sending Request...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 apple-card p-8 text-center">
          <h3 className="text-white text-xl font-semibold mb-4">Need immediate assistance?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <i className="fa-solid fa-phone text-blue-400 text-2xl mb-2"></i>
              <p className="text-white font-medium">Phone</p>
              <p className="text-gray-400">(555) 123-4567</p>
            </div>
            <div>
              <i className="fa-solid fa-envelope text-blue-400 text-2xl mb-2"></i>
              <p className="text-white font-medium">Email</p>
              <p className="text-gray-400">sales@caseindexrt.com</p>
            </div>
            <div>
              <i className="fa-solid fa-clock text-blue-400 text-2xl mb-2"></i>
              <p className="text-white font-medium">Business Hours</p>
              <p className="text-gray-400">Mon-Fri 9AM-6PM PST</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
