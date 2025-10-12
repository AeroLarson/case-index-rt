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
    const { planId, userId, userEmail } = await request.json()

    // Check if user is admin (exempt from charges)
    if (userEmail === 'aero.larson@gmail.com') {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account - no payment required',
        adminExempt: true 
      })
    }

    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json({ 
        success: false, 
        error: 'Payment system not configured. Please contact support.',
        message: 'Payment processing is currently unavailable. Please try again later or contact support.'
      }, { status: 503 })
    }

    const plan = planId === 'pro' ? 'pro' : 'team'
    const priceId = plan === 'pro' 
      ? process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly'
      : process.env.STRIPE_TEAM_PRICE_ID || 'price_team_monthly'

    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        userId,
        planId: plan,
      },
    })

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
