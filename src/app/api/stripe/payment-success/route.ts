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
    const { sessionId } = await request.json()

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ 
        success: false, 
        error: 'Stripe not configured',
        message: 'Payment system is not configured.'
      }, { status: 503 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid') {
      const { userId, planId } = session.metadata || {}
      
      console.log('Payment successful for user:', userId, 'plan:', planId)
      
      // Return success - the frontend will handle the plan update via localStorage
      return NextResponse.json({ 
        success: true, 
        planId,
        userId,
        message: 'Payment processed successfully'
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
