'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'

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
      <Header />
      <Sidebar />
      <main className={`${user ? 'lg:ml-60' : ''} min-h-screen w-full`}>
        <div className="pb-20 lg:pb-0 w-full">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}

