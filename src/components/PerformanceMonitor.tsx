'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkRequests: number
  errors: number
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or for admin users
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      setIsVisible(true)
    }

    // Monitor performance metrics
    const startTime = performance.now()
    
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      setMetrics(prev => ({ ...prev, loadTime }))
    })

    // Track memory usage
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: Math.round(memory.usedJSHeapSize / 1024 / 1024) // MB
        }))
      }
    }

    // Track network requests
    let requestCount = 0
    const originalFetch = window.fetch
    window.fetch = (...args) => {
      requestCount++
      setMetrics(prev => ({ ...prev, networkRequests: requestCount }))
      return originalFetch(...args)
    }

    // Track errors
    const originalError = console.error
    console.error = (...args) => {
      setMetrics(prev => ({ ...prev, errors: prev.errors + 1 }))
      return originalError(...args)
    }

    // Update metrics periodically
    const interval = setInterval(updateMemoryUsage, 5000)

    return () => {
      clearInterval(interval)
      window.fetch = originalFetch
      console.error = originalError
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-white text-xs font-mono z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-green-400 font-bold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      <div className="space-y-1">
        <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
        <div>Memory: {metrics.memoryUsage}MB</div>
        <div>Requests: {metrics.networkRequests}</div>
        <div className={metrics.errors > 0 ? 'text-red-400' : 'text-green-400'}>
          Errors: {metrics.errors}
        </div>
      </div>
    </div>
  )
}