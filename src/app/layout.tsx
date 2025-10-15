import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { CustomizationProvider } from '@/contexts/CustomizationContext'
import LayoutWrapper from '@/components/LayoutWrapper'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import GlobalComponents from '@/components/GlobalComponents'
import OnboardingTour from '@/components/OnboardingTour'
import MobileNav from '@/components/MobileNav'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'

// SEO and Performance Metadata
export const metadata: Metadata = {
  title: {
    default: 'Case Index RT - California Court Case Search & Legal Analytics',
    template: '%s | Case Index RT'
  },
  description: 'Search and track California court cases with AI-powered insights. Real-time case monitoring, document management, and legal analytics for law firms.',
  keywords: ['California court cases', 'legal search', 'case tracking', 'court analytics', 'legal technology', 'law firm software'],
  authors: [{ name: 'Case Index RT Team' }],
  creator: 'Case Index RT',
  publisher: 'Case Index RT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://caseindexrt.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://caseindexrt.com',
    title: 'Case Index RT - California Court Case Search & Legal Analytics',
    description: 'Search and track California court cases with AI-powered insights. Real-time case monitoring, document management, and legal analytics for law firms.',
    siteName: 'Case Index RT',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Case Index RT - Legal Case Search Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Case Index RT - California Court Case Search & Legal Analytics',
    description: 'Search and track California court cases with AI-powered insights. Real-time case monitoring, document management, and legal analytics for law firms.',
    images: ['/og-image.png'],
    creator: '@caseindexrt',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <html lang="en" suppressHydrationWarning>
          <head>
            {/* Preconnect to external domains for faster loading */}
            <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            
            {/* Font Awesome with integrity and async loading */}
            <link 
              rel="stylesheet" 
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
              integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
            
            {/* PWA and Mobile Optimizations */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="format-detection" content="telephone=no" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            <link rel="icon" href="/icon-192x192.svg" type="image/svg+xml" />
            <meta name="theme-color" content="#8b5cf6" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content="Case Index RT" />
            <link rel="apple-touch-icon" href="/icon-192x192.svg" />
            
            {/* Performance hints */}
            <link rel="dns-prefetch" href="//api.caseindexrt.com" />
            <link rel="prefetch" href="/search" />
            <link rel="prefetch" href="/calendar" />
            
            {/* Service Worker Registration */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js')
                        .then(function(registration) {
                          console.log('SW registered: ', registration);
                        })
                        .catch(function(registrationError) {
                          console.log('SW registration failed: ', registrationError);
                        });
                    });
                  }
                `,
              }}
            />
          </head>
          <body className="bg-gray-900 text-white" suppressHydrationWarning>
            <PerformanceMonitor />
            <AuthProvider>
              <CustomizationProvider>
                <GlobalComponents />
                <KeyboardShortcutsModal />
                <OnboardingTour />
                <MobileNav />
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </CustomizationProvider>
            </AuthProvider>
            <Analytics />
            <SpeedInsights />
          </body>
    </html>
  )
}
