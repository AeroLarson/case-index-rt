// Force dynamic rendering for account page to ensure Vercel creates a serverless function
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

