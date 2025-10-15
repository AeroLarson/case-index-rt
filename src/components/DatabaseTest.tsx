'use client'

import { useState } from 'react'

export default function DatabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const result = await response.json()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test database',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-semibold text-gray-900 mb-2">Database Test</h3>
      <button
        onClick={testDatabase}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Database'}
      </button>
      
      {testResult && (
        <div className="mt-3 text-sm">
          <div className={`font-medium ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.success ? '✅ Success' : '❌ Failed'}
          </div>
          <div className="text-gray-600">{testResult.message}</div>
          {testResult.userCount !== undefined && (
            <div className="text-gray-500">Users: {testResult.userCount}</div>
          )}
          {testResult.error && (
            <div className="text-red-500 text-xs mt-1">{testResult.error}</div>
          )}
        </div>
      )}
    </div>
  )
}
