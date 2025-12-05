// Server component layout to ensure proper static generation
export const dynamic = 'force-static'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

