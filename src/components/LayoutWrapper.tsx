'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'
import CaseMonitor from '@/components/CaseMonitor'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Pages that should not show header/sidebar/footer
  const isAuthPage = pathname === '/login' || pathname === '/signin' || pathname === '/reset-password'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <CaseMonitor />
      <Header />
      <Sidebar />
      <main className={`${user ? 'lg:ml-60' : ''} min-h-screen`}>
        <div className="pb-20 lg:pb-0">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}

