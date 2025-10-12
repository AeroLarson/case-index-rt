import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyStart: apiKey?.substring(0, 10) || 'none',
    keyEnd: apiKey?.substring(-10) || 'none'
  })
}
