import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { userProfileManager } from '@/lib/userProfile'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'User ID and Email are required' }, { status: 400 })
    }

    // Get user profile to check if they have a Stripe customer ID
    const userProfile = userProfileManager.getUserProfile(userId, '', userEmail)
    
    if (!userProfile.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No active subscription found. Please upgrade to a paid plan first.' 
      }, { status: 400 })
    }

    // Create Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userProfile.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://caseindexrt.com'}/account`,
    })

    return NextResponse.json({
      success: true,
      url: portalSession.url
    })

  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
  }
}