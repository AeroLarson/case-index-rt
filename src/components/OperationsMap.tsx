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
      description: 'Currently serving California',
      counties: []
    },
    {
      id: 'texas',
      name: 'Texas',
      status: 'planned',
      color: '#94a3b8',
      description: 'Coming soon',
      counties: []
    },
    {
      id: 'florida',
      name: 'Florida',
      status: 'planned',
      color: '#94a3b8',
      description: 'Coming soon',
      counties: []
    },
    {
      id: 'new-york',
      name: 'New York',
      status: 'planned',
      color: '#94a3b8',
      description: 'Coming soon',
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
        {/* Service Coverage States */}
        <div className="vercel-card p-8 mb-8">
          <h3 className="text-white text-xl font-semibold mb-6 text-center">Service Coverage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* California - Active */}
            <div 
              className="vercel-card-premium p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              onMouseEnter={() => setHoveredState('california')}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 vercel-glow">
                <span className="text-white text-2xl font-bold">CA</span>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">California</h4>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm font-medium">Active</span>
              </div>
              <p className="text-gray-300 text-sm">Currently serving</p>
            </div>

            {/* Texas - Planned */}
            <div 
              className="vercel-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              onMouseEnter={() => setHoveredState('texas')}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">TX</span>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Texas</h4>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">Planned</span>
              </div>
              <p className="text-gray-300 text-sm">Coming soon</p>
            </div>

            {/* Florida - Planned */}
            <div 
              className="vercel-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              onMouseEnter={() => setHoveredState('florida')}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">FL</span>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">Florida</h4>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">Planned</span>
              </div>
              <p className="text-gray-300 text-sm">Coming soon</p>
            </div>

            {/* New York - Planned */}
            <div 
              className="vercel-card p-6 text-center cursor-pointer hover:scale-105 transition-transform"
              onMouseEnter={() => setHoveredState('new-york')}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">NY</span>
              </div>
              <h4 className="text-white font-semibold text-lg mb-2">New York</h4>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-400 text-sm font-medium">Planned</span>
              </div>
              <p className="text-gray-300 text-sm">Coming soon</p>
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
        
        
        {/* Contact Information */}
        <div className="mt-6 pt-6 border-t border-blue-400/20">
          <div className="text-center">
            <h4 className="text-white text-lg font-semibold mb-3">Need Coverage in Your County?</h4>
            <p className="text-gray-300 text-sm mb-4">
              Contact us to discuss expanding our services to your area
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a 
                href="mailto:expansion@caseindexrt.com"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-envelope"></i>
                expansion@caseindexrt.com
              </a>
              <a 
                href="tel:+1-555-CASE-RT"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <i className="fa-solid fa-phone"></i>
                (555) CASE-RT
              </a>
            </div>
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
                <p className="text-gray-300 text-sm">Full coverage across all counties</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-clock text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Texas & Florida Expansion</h4>
                <p className="text-gray-300 text-sm">Major metropolitan areas</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-clock text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Northeast Expansion</h4>
                <p className="text-gray-300 text-sm">New York, New Jersey, Connecticut</p>
              </div>
            </div>
            
            <div className="relative flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center z-10">
                <i className="fa-solid fa-clock text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">National Coverage</h4>
                <p className="text-gray-300 text-sm">All 50 states</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
