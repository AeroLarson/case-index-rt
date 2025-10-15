'use client'

import { Suspense, lazy, ComponentType } from 'react'

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: React.ReactNode
  [key: string]: any
}

export default function LazyComponent({ 
  component, 
  fallback = <div className="animate-pulse bg-gray-700 rounded-lg h-32"></div>,
  ...props 
}: LazyComponentProps) {
  const LazyComponent = lazy(component)

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Pre-configured lazy components for common use cases
export const LazyAnalytics = lazy(() => import('@/components/Analytics'))
export const LazyCalendar = lazy(() => import('@/components/Calendar'))
export const LazyDocuments = lazy(() => import('@/components/Documents'))
export const LazyNotifications = lazy(() => import('@/components/Notifications'))