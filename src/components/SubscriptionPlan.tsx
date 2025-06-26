'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  plans, 
  createCheckoutSession, 
  createPortalSession, 
  getSubscription,
  stripePromise 
} from '@/lib/stripe';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Settings } from 'lucide-react';

interface SubscriptionData {
  plan: string;
  product: {
    name: string;
    description: string;
  };
  subscription: {
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  } | null;
}

export default function SubscriptionPlan() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSubscription = useCallback(async () => {
    try {
      const data = await getSubscription();
      setSubscription(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleUpgrade = async (priceId: string) => {
    setActionLoading(priceId);
    
    try {
      const { sessionId } = await createCheckoutSession(priceId);
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      await stripe.redirectToCheckout({ sessionId });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to start checkout process',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading('portal');
    
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal',
        variant: 'destructive',
      });
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = plans.find(plan => plan.id === subscription?.plan) || plans[0];
  const isActive = subscription?.subscription?.status === 'active';
  const willCancel = subscription?.subscription?.cancel_at_period_end;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentPlan.name} Plan
                {isActive && (
                  <Badge variant="default">
                    Active
                  </Badge>
                )}
                {willCancel && (
                  <Badge variant="outline">
                    Cancels {new Date(subscription!.subscription!.current_period_end).toLocaleDateString()}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {currentPlan.description}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${currentPlan.price}
                {currentPlan.price > 0 && <span className="text-sm font-normal">/month</span>}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Features included:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {isActive && (
              <Button
                onClick={handleManageSubscription}
                disabled={actionLoading === 'portal'}
                variant="outline"
                className="w-full"
              >
                {actionLoading === 'portal' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {subscription?.plan !== 'growth' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Upgrade your plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.slice(1).map((plan) => {
              if (plan.id === subscription?.plan) return null;
              
              const isUpgrade = plans.findIndex(p => p.id === plan.id) > 
                             plans.findIndex(p => p.id === subscription?.plan);
              
              if (!isUpgrade) return null;

              return (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      <span className="text-2xl font-bold">
                        ${plan.price}<span className="text-sm font-normal">/month</span>
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleUpgrade(plan.priceId)}
                        disabled={actionLoading === plan.priceId}
                        className="w-full"
                      >
                        {actionLoading === plan.priceId ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Upgrade to {plan.name}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 