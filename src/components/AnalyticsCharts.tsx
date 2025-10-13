'use client'

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function SearchTrendChart({ data }: { data: any[] }) {
  return (
    <div className="apple-card p-6">
      <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
        <i className="fa-solid fa-chart-line text-blue-400"></i>
        Search Trends (Last 6 Months)
      </h3>
      {data.some(d => d.searches > 0) ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="searches"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-chart-line text-gray-600 text-4xl mb-3"></i>
            <p className="text-gray-400">No search data yet</p>
            <p className="text-gray-500 text-sm">Start searching to see trends!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function CaseTypeDistribution({ data }: { data: any[] }) {
  return (
    <div className="apple-card p-6">
      <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
        <i className="fa-solid fa-chart-pie text-purple-400"></i>
        Case Type Distribution
      </h3>
      {data.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-300 text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-chart-pie text-gray-600 text-4xl mb-3"></i>
            <p className="text-gray-400">No saved cases yet</p>
            <p className="text-gray-500 text-sm">Save cases to see distribution!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function WeeklyActivityChart({ data }: { data: any[] }) {
  const hasActivity = data.some(d => d.cases > 0)
  
  return (
    <div className="apple-card p-6">
      <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
        <i className="fa-solid fa-chart-bar text-cyan-400"></i>
        Weekly Activity
      </h3>
      {hasActivity ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="cases" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <i className="fa-solid fa-chart-bar text-gray-600 text-4xl mb-3"></i>
            <p className="text-gray-400">No activity data yet</p>
            <p className="text-gray-500 text-sm">Search for cases throughout the week!</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function StatsCard({ icon, title, value, change, changeType }: {
  icon: string
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}) {
  return (
    <div className="apple-card p-6 hover-glow-subtle transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <i className={`${icon} text-white text-xl`}></i>
          </div>
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <h3 className="text-white text-2xl font-bold">{value}</h3>
          </div>
        </div>
      </div>
      {change && (
        <div className="flex items-center gap-2">
          <i className={`fa-solid ${
            changeType === 'positive' ? 'fa-arrow-up text-green-400' :
            changeType === 'negative' ? 'fa-arrow-down text-red-400' :
            'fa-minus text-gray-400'
          } text-sm`}></i>
          <span className={`text-sm font-medium ${
            changeType === 'positive' ? 'text-green-400' :
            changeType === 'negative' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {change}
          </span>
          <span className="text-gray-500 text-sm">vs last month</span>
        </div>
      )}
    </div>
  )
}
