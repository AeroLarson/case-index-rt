import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with fallback for development
let stripe: Stripe | null = null
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  }
} catch (error) {
  console.warn('Stripe not configured - payment features disabled')
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment system not configured',
        message: 'Customer portal is currently unavailable. Please contact support.'
      }, { status: 503 })
    }

    // For now, return a placeholder since we need customer ID from Stripe
    // In production, you'd store the Stripe customer ID when they first subscribe
    return NextResponse.json({ 
      success: true, 
      message: 'Customer portal coming soon',
      url: '/billing' // Redirect to billing page for now
    })
  } catch (error) {
    console.error('Stripe portal session error:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
