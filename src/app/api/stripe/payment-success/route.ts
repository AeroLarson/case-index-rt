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
    const { sessionId } = await request.json()

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment system not configured',
        message: 'Payment processing is currently unavailable.'
      }, { status: 503 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      const { userId, planId } = session.metadata || {}
      
      // Update user plan in your database
      // For now, we'll return success - the frontend will handle the plan update
      return NextResponse.json({ 
        success: true, 
        planId,
        userId 
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Payment not completed' 
    })
  } catch (error) {
    console.error('Payment success handling error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    )
  }
}
