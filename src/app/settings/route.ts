import { NextResponse } from 'next/server'

// Route handler for settings page - provides the lambda function Vercel expects
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // This route should be handled by the page.tsx, but we provide a handler
  // to satisfy Vercel's lambda requirement
  return NextResponse.redirect('/settings', { status: 307 })
}

