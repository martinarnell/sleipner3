import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Dynamic price fetching
export async function getPrices() {
  const { data: prices } = await supabase
    .from('prices')
    .select(`
      *,
      products:product_id (*)
    `)
    .eq('active', true)
    .order('unit_amount', { ascending: true });

  return prices || [];
}

export async function getPlans() {
  const prices = await getPrices();
  
  return prices.map((price: { id: string; unit_amount: number; products: { id: string; name: string; description: string } }) => ({
    id: price.products.id,
    name: price.products.name,
    description: price.products.description,
    price: price.unit_amount / 100, // Convert from cents
    priceId: price.id,
    features: getFeaturesByPlan(price.products.id),
  }));
}

function getFeaturesByPlan(planId: string) {
  switch (planId) {
    case 'free':
      return [
        '1,000 API calls per month',
        'Basic support',
        'Standard rate limits',
      ];
    case 'team':
      return [
        '10,000 API calls per month',
        'Priority support',
        'Higher rate limits',
        'Team collaboration',
      ];
    case 'growth':
      return [
        '50,000 API calls per month',
        '24/7 priority support',
        'Premium rate limits',
        'Advanced analytics',
        'Custom integrations',
      ];
    default:
      return [];
  }
}

// Fallback static plans (for backward compatibility)
export const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceId: 'price_1ReFfjCxgH7Y8XZUQ2Bkz5ZR',
    features: [
      '1,000 API calls per month',
      'Basic support',
      'Standard rate limits',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'Best for growing teams',
    price: 25,
    priceId: 'price_1ReFflCxgH7Y8XZUlMfwTVXD',
    features: [
      '10,000 API calls per month',
      'Priority support',
      'Higher rate limits',
      'Team collaboration',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For scaling businesses',
    price: 50,
    priceId: 'price_1ReFfmCxgH7Y8XZUcD45t0bD',
    features: [
      '50,000 API calls per month',
      '24/7 priority support',
      'Premium rate limits',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
];

export async function createCheckoutSession(priceId: string) {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
}

export async function createPortalSession() {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create portal session');
  }

  return response.json();
}

export async function getSubscription() {
  const response = await fetch('/api/stripe/subscription');

  if (!response.ok) {
    throw new Error('Failed to get subscription');
  }

  return response.json();
}

export async function cancelSubscription() {
  const response = await fetch('/api/stripe/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to cancel subscription');
  }

  return response.json();
} 