'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I search for a court case?',
    answer: 'Navigate to the Search page, enter a case number, party name, or attorney name, and click Search. You can also use advanced filters to narrow down your results.'
  },
  {
    category: 'Getting Started',
    question: 'How do I create an account?',
    answer: 'Click "Sign up" on the login page. You can create an account using your email and password, or sign in with Google OAuth for quick access.'
  },
  {
    category: 'Account Management',
    question: 'I forgot my password. What do I do?',
    answer: 'On the login page, click "Forgot password?" Enter your email address, and we\'ll send you a secure reset link. The link expires after 1 hour for security.'
  },
  {
    category: 'Account Management',
    question: 'How do I change my subscription plan?',
    answer: 'Go to your Account page and click "Upgrade Plan" or "Manage Subscription". You can upgrade, downgrade, or cancel your plan at any time.'
  },
  {
    category: 'Features',
    question: 'What is the AI Case Summary feature?',
    answer: 'Our AI analyzes court case details and provides concise summaries, key risks, and recommendations. Click "Generate AI Summary" on any case to try it.'
  },
  {
    category: 'Features',
    question: 'Can I save cases for later?',
    answer: 'Yes! Click the bookmark icon on any case to save it. Access all your saved cases from the Dashboard or the Cases page.'
  },
  {
    category: 'Features',
    question: 'How does the calendar integration work?',
    answer: 'When you add a hearing or deadline to your calendar, it\'s automatically saved to your account. You can view all events in the Calendar page, sorted chronologically.'
  },
  {
    category: 'Keyboard Shortcuts',
    question: 'Are there keyboard shortcuts?',
    answer: 'Yes! Press "?" to view all available shortcuts. Some quick ones: Ctrl+K to search, Ctrl+D for dashboard, Ctrl+Shift+C for calendar.'
  },
  {
    category: 'Billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe integration.'
  },
  {
    category: 'Billing',
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 30-day money-back guarantee. Contact support@caseindexrt.com within 30 days of your purchase for a full refund.'
  },
  {
    category: 'Data & Privacy',
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption (bcrypt for passwords, HTTPS for all connections), and store all data in secure databases. We never share your data with third parties.'
  },
  {
    category: 'Data & Privacy',
    question: 'What data do you collect?',
    answer: 'We collect your email, name, search history, and saved cases to provide personalized service. All data collection follows GDPR and CCPA guidelines.'
  },
  {
    category: 'Technical Support',
    question: 'The site is loading slowly. What can I do?',
    answer: 'Try clearing your browser cache, or use a different browser. If the issue persists, contact our support team.'
  },
  {
    category: 'Technical Support',
    question: 'How do I report a bug?',
    answer: 'Email support@caseindexrt.com with a description of the issue, what page you were on, and any error messages. Screenshots are helpful!'
  },
]

export default function HelpPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])

  const categories = Array.from(new Set(faqs.map(faq => faq.category)))

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <i className="fa-solid fa-circle-question text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-gray-300 text-lg">Find answers to frequently asked questions</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <i className="fa-solid fa-search text-gray-400"></i>
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !selectedCategory
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-slate-800/50 text-gray-300 hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="apple-card overflow-hidden transition-all hover:border-purple-500/30">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full p-6 text-left flex items-center justify-between"
              >
                <div className="flex-1">
                  <span className="text-xs text-purple-400 font-semibold mb-2 block">{faq.category}</span>
                  <h3 className="text-white font-semibold text-lg">{faq.question}</h3>
                </div>
                <i className={`fa-solid fa-chevron-down text-gray-400 ml-4 transition-transform ${
                  expandedQuestions.includes(index) ? 'rotate-180' : ''
                }`}></i>
              </button>
              {expandedQuestions.includes(index) && (
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <i className="fa-solid fa-search text-gray-600 text-4xl mb-4"></i>
            <p className="text-gray-400">No results found. Try a different search term.</p>
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-12 apple-card p-8 text-center bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-purple-500/20">
          <h3 className="text-xl font-bold text-white mb-2">Still need help?</h3>
          <p className="text-gray-300 mb-4">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@caseindexrt.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <i className="fa-solid fa-envelope"></i>
              Email Support
            </a>
            <button
              onClick={() => {
                const event = new CustomEvent('showShortcutsModal')
                window.dispatchEvent(event)
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              <i className="fa-solid fa-keyboard"></i>
              View Shortcuts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

