import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
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

    // Get user's subscription with product and price details
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        prices:price_id (
          *,
          products:product_id (*)
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // If no active subscription, user is on free plan
    if (!subscription) {
      const { data: freeProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', 'free')
        .single();

      return NextResponse.json({
        plan: 'free',
        product: freeProduct,
        subscription: null,
      });
    }

    return NextResponse.json({
      plan: subscription.prices?.products?.id || 'unknown',
      product: subscription.prices?.products,
      subscription,
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 