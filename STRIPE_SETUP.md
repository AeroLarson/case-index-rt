# Stripe Integration Setup Guide

This guide will help you set up real Stripe integration for Case Index RT.

## 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the account setup process
3. Verify your business information

## 2. Get Your API Keys

### Test Mode (Development)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### Live Mode (Production)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_live_`)
3. Copy your **Secret key** (starts with `sk_live_`)

## 3. Create Products and Prices

### Create Professional Plan
1. Go to [Products](https://dashboard.stripe.com/test/products) in Stripe Dashboard
2. Click "Add product"
3. Name: "Case Index RT Professional"
4. Description: "Unlimited case searches, AI-powered summaries, calendar integration"
5. Pricing: $99.00/month (recurring)
6. Copy the **Price ID** (starts with `price_`)

### Create Team Plan
1. Create another product
2. Name: "Case Index RT Team"
3. Description: "Everything in Professional + team features, Clio integration"
4. Pricing: $299.00/month (recurring)
5. Copy the **Price ID** (starts with `price_`)

## 4. Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Stripe Price IDs (from step 3)
STRIPE_PRO_PRICE_ID=price_your_pro_price_id_here
STRIPE_TEAM_PRICE_ID=price_your_team_price_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=https://caseindexrt.com
```

## 5. Vercel Environment Variables

Add the same variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRO_PRICE_ID`
   - `STRIPE_TEAM_PRICE_ID`
   - `NEXT_PUBLIC_APP_URL`

## 6. Webhook Setup (Optional but Recommended)

### Create Webhook Endpoint
1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks) in Stripe Dashboard
2. Click "Add endpoint"
3. Endpoint URL: `https://caseindexrt.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Get Webhook Secret
1. After creating the webhook, click on it
2. Go to "Signing secret"
3. Copy the secret (starts with `whsec_`)
4. Add to environment variables: `STRIPE_WEBHOOK_SECRET=whsec_your_secret_here`

## 7. Test the Integration

### Test Mode
1. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Test Flow
1. Go to your site
2. Try to upgrade to Pro plan
3. Use test card `4242 4240 0000 0000`
4. Complete the payment
5. Check that the plan is updated

## 8. Go Live

### Switch to Live Mode
1. Update environment variables with live keys
2. Update price IDs to live price IDs
3. Update webhook endpoint to live URL
4. Test with real (small) transactions

### Live Testing
1. Use real card numbers for small amounts
2. Verify payments appear in Stripe Dashboard
3. Test subscription management
4. Test plan upgrades/downgrades

## 9. Admin Account

The admin account (`aero.larson@gmail.com`) is automatically exempt from payments and can upgrade plans instantly without going through Stripe checkout.

## 10. Troubleshooting

### Common Issues
- **"Stripe not configured"**: Check environment variables
- **"Invalid price ID"**: Verify price IDs in Stripe Dashboard
- **"Webhook signature invalid"**: Check webhook secret
- **"Customer not found"**: Ensure customer creation in checkout

### Debug Mode
- Check browser console for errors
- Check Vercel function logs
- Use Stripe Dashboard to verify events
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [Next.js Stripe Integration](https://stripe.com/docs/payments/quickstart)
