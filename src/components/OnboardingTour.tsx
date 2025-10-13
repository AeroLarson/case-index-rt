'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface TourStep {
  target: string
  title: string
  content: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const tourSteps: TourStep[] = [
  {
    target: '#sidebar-navigation',
    title: 'Welcome to Case Index RT! 🎉',
    content: 'This sidebar is your main navigation. Access all features from here.',
    position: 'right'
  },
  {
    target: '#nav-search',
    title: 'Case Search',
    content: 'Search for California court cases by case number, party name, or attorney.',
    position: 'right'
  },
  {
    target: '#nav-calendar',
    title: 'Calendar',
    content: 'Track all your hearings and deadlines in one place.',
    position: 'right'
  },
  {
    target: '#nav-help',
    title: 'Help Center',
    content: 'Need help? Visit our Help Center or press "?" for keyboard shortcuts.',
    position: 'right'
  },
]

export default function OnboardingTour() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [showTour, setShowTour] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    // Check if user has seen the tour
    if (user) {
      const hasSeenTour = localStorage.getItem(`tour_completed_${user.id}`)
      if (!hasSeenTour) {
        // Wait a bit before showing tour
        setTimeout(() => setShowTour(true), 1000)
      }
    }
  }, [user])

  useEffect(() => {
    if (showTour && currentStep < tourSteps.length) {
      // Small delay to ensure DOM is stable
      const timer = setTimeout(() => {
        const targetElement = document.querySelector(tourSteps[currentStep].target)
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect()
          const pos = tourSteps[currentStep].position

          let top = 0
          let left = 0

          switch (pos) {
            case 'right':
              top = rect.top + rect.height / 2
              left = rect.right + 20
              break
            case 'left':
              top = rect.top + rect.height / 2
              left = rect.left - 320
              break
            case 'top':
              top = rect.top - 180
              left = rect.left + rect.width / 2
              break
            case 'bottom':
              top = rect.bottom + 20
              left = rect.left + rect.width / 2
              break
          }

          setPosition({ top, left })

          // Highlight the target element with a small delay to prevent layout shifts
          setTimeout(() => {
            targetElement.classList.add('tour-highlight')
          }, 100)
        }
      }, 150)

      return () => {
        clearTimeout(timer)
        const targetElement = document.querySelector(tourSteps[currentStep].target)
        if (targetElement) {
          targetElement.classList.remove('tour-highlight')
        }
      }
    }
  }, [showTour, currentStep])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const handleSkip = () => {
    completeTour()
  }

  const completeTour = () => {
    setShowTour(false)
    if (user) {
      localStorage.setItem(`tour_completed_${user.id}`, 'true')
    }
  }

  if (!showTour || currentStep >= tourSteps.length) return null

  const step = tourSteps[currentStep]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-[200]" onClick={handleSkip}></div>

      {/* Tour Card */}
      <div
        className="fixed z-[201] apple-card p-6 max-w-sm shadow-2xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: step.position === 'right' || step.position === 'left' ? 'translateY(-50%)' : 'translateX(-50%)',
        }}
      >
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-400 text-sm font-semibold">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
          <p className="text-gray-300 text-sm">{step.content}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
          >
            {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-4">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 102;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.5), 0 0 30px rgba(139, 92, 246, 0.3);
          border-radius: 8px;
        }
      `}</style>
    </>
  )
}

