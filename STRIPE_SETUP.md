# Stripe Subscription Setup

This application now includes a complete Stripe subscription system with 3 tiers: Free, Team ($25/month), and Growth ($50/month).

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Webhook Secret (CREATED FOR YOU!)
STRIPE_WEBHOOK_SECRET=whsec_yi5EIZW2bjANwuIIAxR1VdG2qAGgvdCD

# Site URL for redirect after checkout
NEXT_PUBLIC_SITE_URL=https://sleipner.ai
```

## Stripe Dashboard Setup

### 1. Create Products and Prices ✅ COMPLETED!

**Products and prices created automatically via CLI:**

- **Free Plan**: `price_1ReFfjCxgH7Y8XZUQ2Bkz5ZR` ($0/month)
- **Team Plan**: `price_1ReFflCxgH7Y8XZUlMfwTVXD` ($25/month) 
- **Growth Plan**: `price_1ReFfmCxgH7Y8XZUcD45t0bD` ($50/month)

### 2. Set Up Webhooks ✅ COMPLETED!

**Webhook endpoint created automatically via CLI:**
```
https://sleipner.ai/api/stripe/webhook
```

**Webhook ID**: `we_1ReFhKCxgH7Y8XZUrb3EBTXM`
**Webhook Secret**: `whsec_yi5EIZW2bjANwuIIAxR1VdG2qAGgvdCD` (already added above)

**Events configured**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `checkout.session.completed`

### 3. Test the Flow

1. Go to `/dashboard` in your app
2. Click on the "Subscription" tab
3. Try upgrading to a paid plan
4. Use Stripe's test card numbers to simulate payments

## Features Included

- ✅ Hosted Stripe Checkout
- ✅ Customer Portal for subscription management
- ✅ Webhook handling for subscription updates
- ✅ Subscription status display
- ✅ Plan upgrade/downgrade flow
- ✅ Automatic customer creation
- ✅ Database sync with Stripe

## API Endpoints

- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks
- `GET /api/stripe/subscription` - Get current subscription
- `POST /api/stripe/cancel` - Cancel subscription
- `POST /api/stripe/portal` - Open customer portal

## Database Schema

The subscription system uses these tables:
- `customers` - Links Supabase users to Stripe customers
- `products` - Stripe products (Free, Team, Growth)
- `prices` - Pricing information for each product
- `subscriptions` - Active subscription records

All tables are already set up in your Supabase database. 