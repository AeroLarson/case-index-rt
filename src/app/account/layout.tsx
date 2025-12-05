import React from 'react'

// Force dynamic rendering for account page - matches working configuration
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

