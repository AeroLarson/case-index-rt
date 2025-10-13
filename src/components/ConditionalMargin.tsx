'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ConditionalMargin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAuthPage = pathname === '/login' || pathname === '/signin' || pathname === '/reset-password'
  const shouldHaveMargin = user && !isAuthPage && mounted

  return (
    <main className={shouldHaveMargin ? 'lg:ml-60' : ''}>
      {children}
    </main>
  )
}

