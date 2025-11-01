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
    const { userId, userEmail } = await request.json()

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Check if user is admin (should not cancel admin subscriptions)
    if (userEmail === 'aero.larson@gmail.com') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted' },
        { status: 403 }
      )
    }

    console.log(`Cancelling subscription for user: ${userId}, email: ${userEmail}`)

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

    // Find the customer in Stripe
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (customers.data.length === 0) {
      console.log(`No Stripe customer found for email: ${userEmail}`)
      return NextResponse.json({
        success: true,
        message: 'No active subscription found'
      })
    }

    const customer = customers.data[0]
    console.log(`Found Stripe customer: ${customer.id}`)

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active'
    })

    if (subscriptions.data.length === 0) {
      console.log(`No active subscriptions found for customer: ${customer.id}`)
      return NextResponse.json({
        success: true,
        message: 'No active subscription found'
      })
    }

    // Cancel all active subscriptions
    const cancelledSubscriptions = []
    for (const subscription of subscriptions.data) {
      try {
        const cancelledSubscription = await stripe.subscriptions.cancel(subscription.id)
        cancelledSubscriptions.push(cancelledSubscription.id)
        console.log(`Cancelled subscription: ${subscription.id}`)
      } catch (error) {
        console.error(`Error cancelling subscription ${subscription.id}:`, error)
      }
    }

    // Also cancel any pending subscriptions
    const pendingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'incomplete'
    })

    for (const subscription of pendingSubscriptions.data) {
      try {
        const cancelledSubscription = await stripe.subscriptions.cancel(subscription.id)
        cancelledSubscriptions.push(cancelledSubscription.id)
        console.log(`Cancelled pending subscription: ${subscription.id}`)
      } catch (error) {
        console.error(`Error cancelling pending subscription ${subscription.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      cancelledSubscriptions
    })

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
