'use client'

import React, { Suspense } from 'react'
import SearchPageContent from './SearchPageContent'

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div role="main" className="min-h-screen animated-aura" style={{ background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)', padding: '40px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading search…</p>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
