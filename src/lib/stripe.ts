// Stripe Payment Integration
import { loadStripe } from '@stripe/stripe-js'

// Get Stripe publishable key with fallback
const getStripePublishableKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (!key) {
    console.warn('Stripe publishable key not found. Using test key for development.')
    return 'pk_test_51234567890abcdef' // Fallback test key
  }
  return key
}

// Initialize Stripe with error handling
let stripePromise: Promise<any> | null = null

try {
  stripePromise = loadStripe(getStripePublishableKey())
} catch (error) {
  console.error('Failed to initialize Stripe:', error)
  stripePromise = null
}

export const getStripe = () => {
  if (!stripePromise) {
    console.warn('Stripe not initialized. Payment features will be disabled.')
    return Promise.resolve(null)
  }
  return stripePromise
}

// Payment service for handling subscriptions
export class PaymentService {
  static async createCheckoutSession(planId: string, userId: string, userEmail: string) {
    try {
      // Check if Stripe is available
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe is not available. Please check your configuration.')
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          userEmail,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }

  static async createCustomerPortalSession(userId: string) {
    try {
      // Check if Stripe is available
      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe is not available. Please check your configuration.')
      }

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  }

  static async handlePaymentSuccess(sessionId: string) {
    try {
      const response = await fetch('/api/stripe/payment-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error handling payment success:', error)
      throw error
    }
  }
}

// Plan configurations
export const STRIPE_PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    amount: 9900, // $99.00 in cents
    name: 'Professional',
    features: [
      'Unlimited case searches',
      'AI-powered case summaries',
      'Calendar integration',
      'Advanced analytics',
      'Priority support'
    ]
  },
  team: {
    priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team_monthly',
    amount: 29900, // $299.00 in cents
    name: 'Team',
    features: [
      'Everything in Professional',
      'Up to 5 team members',
      'Clio CRM integration',
      'Custom reporting',
      'Dedicated account manager',
      'Phone support'
    ]
  }
}
