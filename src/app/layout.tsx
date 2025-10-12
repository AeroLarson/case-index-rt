import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Case Index RT - California Court Case Search',
  description: 'Track family law cases, hearings, and filings across San Diego County with AI-powered precision.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-900 text-white" suppressHydrationWarning>
        <AuthProvider>
          <Header />
          <Sidebar />
          <main className="lg:ml-60">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
