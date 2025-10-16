'use client'

import { useState } from 'react'

export default function OperationsMap() {
  const [hoveredState, setHoveredState] = useState<string | null>(null)

  const states = [
    {
      id: 'california',
      name: 'California',
      status: 'active',
      color: '#667eea',
      description: 'Currently serving all counties',
      counties: ['San Diego', 'Los Angeles', 'Orange', 'Riverside', 'San Bernardino', 'Ventura', 'Imperial', 'Kern', 'Fresno', 'Sacramento']
    },
    {
      id: 'texas',
      name: 'Texas',
      status: 'planned',
      color: '#94a3b8',
      description: 'Expansion planned for 2024',
      counties: []
    },
    {
      id: 'florida',
      name: 'Florida',
      status: 'planned',
      color: '#94a3b8',
      description: 'Expansion planned for 2024',
      counties: []
    },
    {
      id: 'new-york',
      name: 'New York',
      status: 'planned',
      color: '#94a3b8',
      description: 'Expansion planned for 2025',
      counties: []
    }
  ]

  return (
    <div className="vercel-card-premium p-8">
      <div className="text-center mb-8">
        <h2 className="text-white text-3xl font-bold mb-4 vercel-text-gradient-intense">
          Operations Map
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Currently serving California with plans to expand nationwide. 
          Track our growth and see where we're heading next.
        </p>
      </div>

      {/* Interactive Map Visualization */}
      <div className="relative mb-8">
        {/* Actual Map Visualization */}
        <div className="vercel-card p-8 mb-8">
          <h3 className="text-white text-xl font-semibold mb-6 text-center">Service Coverage Map</h3>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 overflow-hidden">
            {/* Map Background */}
            <div className="relative w-full h-96 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl overflow-hidden">
              {/* Simplified US Map with California Highlighted */}
              <svg 
                viewBox="0 0 800 500" 
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              >
                {/* Background States (Gray) */}
                <g opacity="0.3">
                  {/* Texas */}
                  <path 
                    d="M200 300 L350 300 L350 400 L200 400 Z" 
                    fill="#64748b" 
                    className="hover:fill-slate-500 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredState('texas')}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                  {/* Florida */}
                  <path 
                    d="M500 350 L600 350 L600 450 L500 450 Z" 
                    fill="#64748b" 
                    className="hover:fill-slate-500 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredState('florida')}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                  {/* New York */}
                  <path 
                    d="M600 100 L700 100 L700 200 L600 200 Z" 
                    fill="#64748b" 
                    className="hover:fill-slate-500 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredState('new-york')}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                </g>
                
                {/* California - Highlighted and Active */}
                <g>
                  <path 
                    d="M50 200 L300 200 L300 400 L50 400 Z" 
                    fill="url(#californiaGradient)" 
                    stroke="#3b82f6"
                    strokeWidth="3"
                    className="vercel-glow cursor-pointer animate-pulse"
                    onMouseEnter={() => setHoveredState('california')}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                  
                  {/* California Label */}
                  <text 
                    x="175" 
                    y="300" 
                    textAnchor="middle" 
                    className="fill-white text-lg font-bold"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                  >
                    CALIFORNIA
                  </text>
                  
                  {/* Active Indicator */}
                  <circle 
                    cx="280" 
                    cy="220" 
                    r="8" 
                    fill="#10b981"
                    className="animate-ping"
                  />
                  <circle 
                    cx="280" 
                    cy="220" 
                    r="4" 
                    fill="#10b981"
                  />
                </g>
                
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="californiaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8"/>
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Active Service</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-300 text-sm">Planned Expansion</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-medium">58 Counties Covered</div>
                  <div className="text-gray-300 text-xs">100% Family Law</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* State Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {states.map((state) => (
            <div
              key={state.id}
              className={`relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                state.status === 'active'
                  ? 'vercel-card-premium vercel-glow'
                  : 'vercel-card hover:border-gray-500/50'
              }`}
              onMouseEnter={() => setHoveredState(state.id)}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: state.color }}
                  />
                  <h3 className="text-white font-semibold text-lg">{state.name}</h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  state.status === 'active'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {state.status === 'active' ? 'Active' : 'Planned'}
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{state.description}</p>
              
              {state.status === 'active' && state.counties.length > 0 && (
                <div className="space-y-2">
                  <p className="text-blue-300 text-xs font-medium">Serving Counties:</p>
                  <div className="flex flex-wrap gap-1">
                    {state.counties.slice(0, 3).map((county) => (
                      <span 
                        key={county}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                      >
                        {county}
                      </span>
                    ))}
                    {state.counties.length > 3 && (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-md">
                        +{state.counties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* California Focus Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-map-marked-alt text-white text-xl"></i>
          </div>
          <div>
            <h3 className="text-white text-xl font-semibold">California Operations</h3>
            <p className="text-blue-300 text-sm">Primary service area</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">58</div>
            <div className="text-gray-300 text-sm">Counties Covered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">100%</div>
            <div className="text-gray-300 text-sm">Family Law Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-300 text-sm">Case Monitoring</div>
          </div>
        </div>
      </div>

      {/* Expansion Timeline */}
      <div className="mt-8">
        <h3 className="text-white text-xl font-semibold mb-6 text-center">Expansion Timeline</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          <div className="space-y-6">
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-check text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">California Launch</h4>
                <p className="text-gray-300 text-sm">Q4 2023 - Full coverage across all counties</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-clock text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Texas & Florida Expansion</h4>
                <p className="text-gray-300 text-sm">Q2 2024 - Major metropolitan areas</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-clock text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Northeast Expansion</h4>
                <p className="text-gray-300 text-sm">Q4 2024 - New York, New Jersey, Connecticut</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-clock text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">National Coverage</h4>
                <p className="text-gray-300 text-sm">2025 - All 50 states</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
