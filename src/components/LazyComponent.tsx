'use client'

import { Suspense, lazy, ComponentType } from 'react'

interface LazyComponentProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

// Default loading fallback
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  </div>
)

// Lazy wrapper component
export function LazyComponent({ fallback = <DefaultFallback />, children }: LazyComponentProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  )
}

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  Component: ComponentType<T>,
  fallback?: React.ReactNode
) {
  return function LazyLoadedComponent(props: T) {
    return (
      <LazyComponent fallback={fallback}>
        <Component {...props} />
      </LazyComponent>
    )
  }
}

// Pre-configured lazy components
export const LazyDocumentManager = lazy(() => import('@/components/DocumentManager'))
export const LazyCaseMonitor = lazy(() => import('@/components/CaseMonitor'))
export const LazyCourtRulesAI = lazy(() => import('@/components/CourtRulesAI'))

export default LazyComponent
