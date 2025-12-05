import React from 'react'

// Force dynamic rendering for settings page - matches working account configuration
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

