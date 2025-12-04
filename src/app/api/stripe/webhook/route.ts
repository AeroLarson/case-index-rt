import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { userProfileManager } from '@/lib/userProfile'
import { PaymentTracker } from '@/lib/paymentTracker'

// Initialize Stripe only if secret key is available
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
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
    userProfileManager.updatePlan(userId, planId as 'pro' | 'team')

    // Create payment record
    const amount = planId === 'pro' ? 99 : 299
    PaymentTracker.addPaymentRecord({
      userId,
      userEmail: session.customer_email || '',
      userName: session.customer_details?.name || '',
      planId: planId as 'pro' | 'team',
      amount,
      status: 'completed',
      stripeSessionId: session.id,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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
    
    // Get plan from subscription metadata
    const planId = subscription.metadata?.planId || subscription.items.data[0]?.price?.nickname
    
    // Note: userProfileManager uses localStorage which is client-side only
    // In production, update a database here. For now, client-side will handle via payment success
    // The webhook metadata should include userId for proper handling
    
    if (planId && (planId === 'pro' || planId === 'team')) {
      const userId = subscription.metadata?.userId
      if (userId && typeof window !== 'undefined') {
        // Only update if running client-side (shouldn't happen in webhook, but safe check)
        userProfileManager.updatePlan(userId, planId as 'pro' | 'team')
        console.log(`Plan updated for user ${userId} to ${planId}`)
      } else {
        // Server-side: Log for database update (in production, update database here)
        console.log(`Plan update needed for user ${userId} to ${planId} - handled client-side`)
      }
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Subscription deleted:', subscription.id)
    
    // Downgrade user to free plan when subscription is cancelled
    const userId = subscription.metadata?.userId
    if (userId) {
      if (typeof window !== 'undefined') {
        // Only update if running client-side
        userProfileManager.updatePlan(userId, 'free')
        console.log(`Plan downgraded to free for user ${userId}`)
      } else {
        // Server-side: Log for database update (in production, update database here)
        console.log(`Plan downgrade needed for user ${userId} to free - handled client-side`)
      }
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment succeeded:', invoice.id)
    
    // Update payment record for recurring subscription
    const subscriptionId = invoice.subscription as string
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.userId
      const planId = subscription.items.data[0]?.price?.nickname || subscription.metadata?.planId
      
      if (userId && planId) {
        const amount = planId === 'pro' ? 99 : 299
        PaymentTracker.addPaymentRecord({
          userId,
          userEmail: invoice.customer_email || '',
          userName: invoice.customer_name || '',
          planId: planId as 'pro' | 'team',
          amount,
          status: 'completed',
          stripeInvoiceId: invoice.id,
          stripeSessionId: subscriptionId,
          nextBillingDate: new Date(invoice.period_end * 1000).toISOString()
        })
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Invoice payment failed:', invoice.id)
    
    // Notify user about failed payment
    const subscriptionId = invoice.subscription as string
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const userId = subscription.metadata?.userId
      
      if (userId) {
        // In production, send notification email
        console.log(`Payment failed for user ${userId}. Subscription may be cancelled.`)
        // Optionally downgrade to free plan after grace period
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error)
  }
}
