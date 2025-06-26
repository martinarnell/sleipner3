import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 