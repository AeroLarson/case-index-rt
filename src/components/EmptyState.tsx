'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaFileAlt, 
  FaStar,
  FaPlus,
  FaArrowRight
} from 'react-icons/fa'

interface EmptyStateProps {
  type: 'dashboard' | 'search' | 'calendar' | 'documents' | 'saved-cases'
}

export default function EmptyState({ type }: EmptyStateProps) {
  const { userProfile } = useAuth()
  const router = useRouter()

  const getEmptyStateContent = () => {
    switch (type) {
      case 'dashboard':
        return {
          icon: <FaSearch className="w-16 h-16 text-gray-400" />,
          title: "Welcome to your legal dashboard!",
          description: "Start by searching for cases, saving important ones, or exploring our features.",
          actions: [
            {
              label: "Search Cases",
              icon: <FaSearch className="w-4 h-4" />,
              onClick: () => router.push('/search'),
              primary: true
            },
            {
              label: "View Calendar",
              icon: <FaCalendarAlt className="w-4 h-4" />,
              onClick: () => router.push('/calendar')
            }
          ]
        }
      
      case 'search':
        return {
          icon: <FaSearch className="w-16 h-16 text-gray-400" />,
          title: "No search results yet",
          description: "Enter a case number, party name, or attorney to start searching.",
          actions: [
            {
              label: "Start Searching",
              icon: <FaSearch className="w-4 h-4" />,
              onClick: () => router.push('/search'),
              primary: true
            }
          ]
        }
      
      case 'calendar':
        return {
          icon: <FaCalendarAlt className="w-16 h-16 text-gray-400" />,
          title: "Your calendar is empty",
          description: "Save cases to automatically populate your calendar with hearing dates and deadlines.",
          actions: [
            {
              label: "Search Cases",
              icon: <FaSearch className="w-4 h-4" />,
              onClick: () => router.push('/search'),
              primary: true
            }
          ]
        }
      
      case 'documents':
        return {
          icon: <FaFileAlt className="w-16 h-16 text-gray-400" />,
          title: "No documents yet",
          description: "Documents will appear here when you save cases with document attachments.",
          actions: [
            {
              label: "Find Cases",
              icon: <FaSearch className="w-4 h-4" />,
              onClick: () => router.push('/search'),
              primary: true
            }
          ]
        }
      
      case 'saved-cases':
        return {
          icon: <FaStar className="w-16 h-16 text-gray-400" />,
          title: "No saved cases yet",
          description: "Save cases you're tracking to see them here. Star important cases for quick access.",
          actions: [
            {
              label: "Search Cases",
              icon: <FaSearch className="w-4 h-4" />,
              onClick: () => router.push('/search'),
              primary: true
            }
          ]
        }
      
      default:
        return {
          icon: <FaPlus className="w-16 h-16 text-gray-400" />,
          title: "Nothing here yet",
          description: "Start exploring to see content appear here.",
          actions: []
        }
    }
  }

  const content = getEmptyStateContent()
  const isNewUser = userProfile?.savedCases.length === 0 && userProfile?.recentSearches.length === 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="mb-6">
        {content.icon}
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        {content.title}
      </h3>
      
      <p className="text-gray-300 mb-8 max-w-md">
        {content.description}
      </p>

      {isNewUser && type === 'dashboard' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaArrowRight className="w-5 h-5 text-blue-600 mt-0.5" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                New to the platform?
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                You're currently on the <strong>{userProfile?.plan === 'free' ? 'Free' : userProfile?.plan === 'pro' ? 'Professional' : 'Team'} plan</strong> with {userProfile?.plan === 'free' ? '1 case search per month' : userProfile?.plan === 'pro' ? 'unlimited searches and advanced features' : 'unlimited searches, team collaboration, and Clio integration'}. 
                {userProfile?.plan === 'free' && ' Upgrade to Pro for unlimited searches and advanced features.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {content.actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          {content.actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                action.primary
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {userProfile && (
        <div className="mt-8 text-xs text-gray-500">
          <p>Monthly usage: {userProfile.monthlyUsage}/{userProfile.maxMonthlyUsage}</p>
          <p>Plan: {userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1)}</p>
        </div>
      )}
    </div>
  )
}
