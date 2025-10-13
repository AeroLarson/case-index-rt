'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface CaseMonitorProps {
  caseNumber: string
  onUpdate?: (caseData: any) => void
}

interface MonitoringStatus {
  isMonitoring: boolean
  lastChecked: Date | null
  lastUpdate: Date | null
  updateCount: number
  alerts: Array<{
    id: string
    type: 'new_filing' | 'hearing_scheduled' | 'status_change' | 'deadline'
    message: string
    timestamp: Date
    priority: 'low' | 'medium' | 'high'
  }>
}

export default function CaseMonitor({ caseNumber, onUpdate }: CaseMonitorProps) {
  const { user, userProfile } = useAuth()
  const [status, setStatus] = useState<MonitoringStatus>({
    isMonitoring: false,
    lastChecked: null,
    lastUpdate: null,
    updateCount: 0,
    alerts: []
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (caseNumber) {
      loadMonitoringStatus()
    }
  }, [caseNumber])

  const loadMonitoringStatus = async () => {
    try {
      // Load monitoring status from user profile
      const monitoringData = userProfile?.monitoredCases?.[caseNumber]
      if (monitoringData) {
        setStatus(monitoringData)
      }
    } catch (error) {
      console.error('Error loading monitoring status:', error)
    }
  }

  const toggleMonitoring = async () => {
    setIsLoading(true)
    
    try {
      const newStatus = !status.isMonitoring
      
      if (newStatus) {
        // Start monitoring
        const response = await fetch('/api/case-monitoring/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            caseNumber,
            monitoringInterval: 'daily' // daily, weekly, real-time
          })
        })

        if (response.ok) {
          setStatus(prev => ({
            ...prev,
            isMonitoring: true,
            lastChecked: new Date()
          }))
        }
      } else {
        // Stop monitoring
        await fetch('/api/case-monitoring/stop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            caseNumber
          })
        })

        setStatus(prev => ({
          ...prev,
          isMonitoring: false
        }))
      }
    } catch (error) {
      console.error('Error toggling monitoring:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkForUpdates = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/case-monitoring/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          caseNumber
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.hasUpdates) {
          setStatus(prev => ({
            ...prev,
            lastChecked: new Date(),
            lastUpdate: new Date(),
            updateCount: prev.updateCount + data.updates.length,
            alerts: [...prev.alerts, ...data.updates]
          }))
          
          if (onUpdate) {
            onUpdate(data.caseData)
          }
        } else {
          setStatus(prev => ({
            ...prev,
            lastChecked: new Date()
          }))
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearAlerts = () => {
    setStatus(prev => ({
      ...prev,
      alerts: []
    }))
  }

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Case Monitoring</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status.isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className={`text-sm font-medium ${
            status.isMonitoring ? 'text-green-400' : 'text-gray-400'
          }`}>
            {status.isMonitoring ? 'Monitoring Active' : 'Not Monitoring'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Monitoring Controls */}
        <div className="flex gap-3">
          <button
            onClick={toggleMonitoring}
            disabled={isLoading}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
              status.isMonitoring
                ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400'
                : 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : status.isMonitoring ? (
              'Stop Monitoring'
            ) : (
              'Start Monitoring'
            )}
          </button>
          
          <button
            onClick={checkForUpdates}
            disabled={isLoading || !status.isMonitoring}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 py-2 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            Check Now
          </button>
        </div>

        {/* Monitoring Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white text-xl font-bold">{status.updateCount}</p>
            <p className="text-gray-400 text-sm">Updates Found</p>
          </div>
          <div>
            <p className="text-white text-xl font-bold">
              {status.lastChecked ? 
                new Date(status.lastChecked).toLocaleDateString() : 
                'Never'
              }
            </p>
            <p className="text-gray-400 text-sm">Last Checked</p>
          </div>
          <div>
            <p className="text-white text-xl font-bold">
              {status.alerts.length}
            </p>
            <p className="text-gray-400 text-sm">Active Alerts</p>
          </div>
        </div>

        {/* Recent Alerts */}
        {status.alerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">Recent Alerts</h4>
              <button
                onClick={clearAlerts}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {status.alerts.slice(-5).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    alert.priority === 'high' 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : alert.priority === 'medium'
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.priority === 'high' 
                        ? 'bg-red-400' 
                        : alert.priority === 'medium'
                        ? 'bg-orange-400'
                        : 'bg-blue-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{alert.message}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
