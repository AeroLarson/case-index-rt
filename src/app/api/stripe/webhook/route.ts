import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { databaseUserProfileManager } from '@/lib/databaseUserProfile'
import { databasePaymentTracker } from '@/lib/databasePaymentTracker'

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
    // Get Stripe instance
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 503 })
    }

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const { userId, planId } = session.metadata || {}
    
    if (!userId || !planId) {
      console.error('Missing metadata in checkout session:', session.id)
      return
    }

    // Update user plan
    await databaseUserProfileManager.updatePlan(userId, planId as 'pro' | 'team')

    // Create payment record
    const amount = planId === 'pro' ? 99 : 299
    await databasePaymentTracker.addPaymentRecord({
      userId,
      userEmail: session.customer_email || '',
      userName: session.customer_details?.name || '',
      planId: planId as 'pro' | 'team',
      amount,
      status: 'completed',
      stripeSessionId: session.id,
      stripePaymentId: session.payment_intent as string,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })

    console.log(`Plan updated for user ${userId} to ${planId}`)
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription created:', subscription.id)
    // Handle subscription creation if needed
  } catch (error) {
    console.error('Error handling subscription created:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription updated:', subscription.id)
    // Handle subscription updates if needed
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id)
    // Handle subscription cancellation if needed
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id)
    // Handle successful recurring payments
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment failed:', invoice.id)
    // Handle failed payments
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}
