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
    const { planId, userId, userEmail } = await request.json()
    
    console.log('Stripe checkout request:', { planId, userId, userEmail })
    console.log('Environment check:', {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      proPriceId: process.env.STRIPE_PRO_PRICE_ID,
      teamPriceId: process.env.STRIPE_TEAM_PRICE_ID
    })

    // Check if user is admin (exempt from charges)
    if (userEmail === 'aero.larson@gmail.com') {
      console.log('Admin account detected - no payment required')
      return NextResponse.json({ 
        success: true, 
        message: 'Admin account - no payment required',
        adminExempt: true 
      })
    }

    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      console.error('Stripe not configured - missing secret key')
      return NextResponse.json({ 
        success: false, 
        error: 'Stripe not configured',
        message: 'Payment system is not configured. Please contact support.'
      }, { status: 503 })
    }

    const plan = planId === 'pro' ? 'pro' : 'team'
    const priceId = plan === 'pro' 
      ? process.env.STRIPE_PRO_PRICE_ID || 'price_1SIPXzLng9ZTfDuZYourProPriceId'
      : process.env.STRIPE_TEAM_PRICE_ID || 'price_1SIPXzLng9ZTfDuZYourTeamPriceId'
    
    console.log('Using price ID:', priceId)

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://caseindexrt.com'}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://caseindexrt.com'}/billing?canceled=true`,
      metadata: {
        userId,
        planId: plan,
      },
    })

    console.log('Stripe session created successfully:', session.id)
    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
