'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, validateSession } = useAuth()
  
  // Pages that should not show header/sidebar/footer
  const isAuthPage = pathname === '/login' || pathname === '/signin' || pathname === '/reset-password'

  // Validate session on every render to prevent unexpected logouts
  React.useEffect(() => {
    if (user && !validateSession()) {
      console.log('LayoutWrapper: Session validation failed, user will be logged out')
      // Don't force logout here, let the AuthContext handle it
    }
  }, [user, validateSession])

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
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

