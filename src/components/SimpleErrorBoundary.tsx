'use client'

import React from 'react'

interface SimpleErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface SimpleErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

class SimpleErrorBoundary extends React.Component<SimpleErrorBoundaryProps, SimpleErrorBoundaryState> {
  constructor(props: SimpleErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): SimpleErrorBoundaryState {
    console.error('SimpleErrorBoundary caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SimpleErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="apple-card p-6 text-center">
          <i className="fa-solid fa-exclamation-triangle text-4xl text-yellow-400 mb-4"></i>
          <h3 className="text-white text-lg font-semibold mb-2">Component Error</h3>
          <p className="text-gray-400 text-sm">This component encountered an error. Please try refreshing the page.</p>
        </div>
      )
    }

    return this.props.children
  }
}

export default SimpleErrorBoundary
