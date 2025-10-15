'use client'

import { useEffect } from 'react'

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return

    // Web Vitals monitoring
    const reportWebVitals = (metric: any) => {
      // Send to analytics service
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        })
      }
    }

    // Import and initialize web-vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals)
      getFID(reportWebVitals)
      getFCP(reportWebVitals)
      getLCP(reportWebVitals)
      getTTFB(reportWebVitals)
    }).catch(() => {
      // web-vitals not available, skip
    })

    // Performance observer for custom metrics
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Log long tasks
          if (entry.entryType === 'longtask') {
            console.warn('Long task detected:', entry.duration)
          }
          
          // Log layout shifts
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            console.warn('Layout shift detected:', (entry as any).value)
          }
        }
      })

      try {
        observer.observe({ entryTypes: ['longtask', 'layout-shift'] })
      } catch (e) {
        // Some browsers don't support all entry types
      }
    }

    // Memory usage monitoring (if available)
    if ('memory' in performance) {
      const logMemoryUsage = () => {
        const memory = (performance as any).memory
        if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB threshold
          console.warn('High memory usage detected:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
          })
        }
      }

      // Check memory usage every 30 seconds
      const memoryInterval = setInterval(logMemoryUsage, 30000)
      
      return () => clearInterval(memoryInterval)
    }
  }, [])

  return null // This component doesn't render anything
}
