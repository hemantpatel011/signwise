import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string;
  subscriptionEnd: string | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckoutSession: (plan: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  canAccessFeature: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const checkSubscription = async () => {
    if (!currentUser) {
      setSubscribed(false);
      setSubscriptionTier('free');
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscribed(data.subscribed || false);
      setSubscriptionTier(data.subscription_tier || 'free');
      setSubscriptionEnd(data.subscription_end || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscribed(false);
      setSubscriptionTier('free');
      setSubscriptionEnd(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (plan: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const canAccessFeature = (feature: string): boolean => {
    switch (feature) {
      case 'unlimited_analysis':
        return subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
      case 'ai_chat':
        return subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
      case 'advanced_insights':
        return subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
      case 'export_reports':
        return subscriptionTier === 'pro' || subscriptionTier === 'enterprise';
      case 'api_access':
        return subscriptionTier === 'enterprise';
      case 'custom_training':
        return subscriptionTier === 'enterprise';
      case 'sso_integration':
        return subscriptionTier === 'enterprise';
      default:
        return true; // Free features
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const value = {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    loading,
    checkSubscription,
    createCheckoutSession,
    openCustomerPortal,
    canAccessFeature
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}