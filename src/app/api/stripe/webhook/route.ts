import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Use service role key for webhook operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionRecord(subscription);
        break;
      
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await upsertSubscriptionRecord(subscription);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function upsertSubscriptionRecord(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Get the customer record to find the user ID
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!customer) {
    console.error('Customer not found for subscription:', subscription.id);
    return;
  }

  const subscriptionData = {
    id: subscription.id,
    user_id: customer.id,
    metadata: subscription.metadata,
    status: subscription.status as 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused',
    price_id: subscription.items.data[0]?.price.id,
    quantity: subscription.items.data[0]?.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: new Date((subscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000).toISOString(),
    created: new Date(subscription.created * 1000).toISOString(),
    ended_at: subscription.ended_at
      ? new Date(subscription.ended_at * 1000).toISOString()
      : null,
    cancel_at: subscription.cancel_at
      ? new Date(subscription.cancel_at * 1000).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  };

  const { error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData);

  if (error) {
    console.error('Error upserting subscription:', error);
  }
} 