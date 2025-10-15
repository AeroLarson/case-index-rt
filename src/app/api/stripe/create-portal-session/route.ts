import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe only if secret key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ 
        success: false, 
        error: 'Stripe not configured',
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
