import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CustomizationProvider } from '@/contexts/CustomizationContext'
import LayoutWrapper from '@/components/LayoutWrapper'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import GlobalComponents from '@/components/GlobalComponents'
import OnboardingTour from '@/components/OnboardingTour'

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
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#8b5cf6" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="Case Index RT" />
          </head>
          <body className="bg-gray-900 text-white" suppressHydrationWarning>
            <AuthProvider>
              <CustomizationProvider>
                <GlobalComponents />
                <KeyboardShortcutsModal />
                <OnboardingTour />
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </CustomizationProvider>
            </AuthProvider>
          </body>
    </html>
  )
}
