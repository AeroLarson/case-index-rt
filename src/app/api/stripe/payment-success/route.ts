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
      
      // Get or create Stripe customer ID
      let customerId = session.customer as string
      if (customerId && typeof customerId === 'string' && !customerId.startsWith('cus_')) {
        // If customer is an object ID, get the actual customer
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && !customer.deleted) {
            customerId = customer.id
          }
        } catch (e) {
          console.error('Error retrieving customer:', e)
        }
      }
      
      console.log('Payment successful for user:', userId, 'plan:', planId, 'customer:', customerId)
      
      // Return success with customer ID - the frontend will handle the plan update via localStorage
      return NextResponse.json({ 
        success: true, 
        planId,
        userId,
        stripeCustomerId: customerId || null,
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
