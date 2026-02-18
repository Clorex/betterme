'use client';

export interface FlutterwaveConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options: string;
  customer: {
    email: string;
    name: string;
  };
  customizations: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: FlutterwaveResponse) => void;
  onclose: () => void;
}

export interface FlutterwaveResponse {
  status: string;
  transaction_id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  charged_amount: number;
  customer: {
    email: string;
    name: string;
  };
}

export const SUBSCRIPTION_PLANS = {
  pro_monthly: {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    description: 'Full access to all features',
    priceUSD: 9.99,
    priceNGN: 2999,
    interval: 'monthly',
    plan: 'pro',
    features: [
      'AI Food Analyzer (5 photos)',
      'AI Meal Plans',
      'AI Workout Generator',
      'AI Coach Chat',
      'Full tracking features',
      'Community posting',
      'No ads',
    ],
  },
  pro_annual: {
    id: 'pro_annual',
    name: 'Pro Annual',
    description: 'Full access - save 33%!',
    priceUSD: 79.99,
    priceNGN: 29999,
    interval: 'annual',
    plan: 'pro',
    savings: '33%',
    features: [
      'Everything in Pro Monthly',
      'Save 33% compared to monthly',
    ],
  },
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    description: 'The ultimate transformation package',
    priceUSD: 24.99,
    priceNGN: 7999,
    interval: 'monthly',
    plan: 'premium',
    features: [
      'Everything in Pro',
      'Advanced analytics & insights',
      'Family mode',
      'Priority AI responses',
      'Custom programs',
      'Export reports',
      'Early access to new features',
    ],
  },
  premium_annual: {
    id: 'premium_annual',
    name: 'Premium Annual',
    description: 'The ultimate package - save 33%!',
    priceUSD: 199.99,
    priceNGN: 79999,
    interval: 'annual',
    plan: 'premium',
    savings: '33%',
    features: [
      'Everything in Premium Monthly',
      'Save 33% compared to monthly',
    ],
  },
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export function generateTxRef(): string {
  return `BM-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getPrice(planId: PlanId, currency: string): number {
  const plan = SUBSCRIPTION_PLANS[planId];
  return currency === 'NGN' ? plan.priceNGN : plan.priceUSD;
}

export function getCurrency(): string {
  // Simple detection - in production use a proper geo IP service
  if (typeof window !== 'undefined') {
    const lang = navigator.language || '';
    if (lang.includes('NG') || lang.includes('ng')) return 'NGN';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.includes('Lagos') || tz.includes('Africa')) return 'NGN';
  }
  return 'USD';
}

export function initializeFlutterwavePayment(config: FlutterwaveConfig): void {
  // Dynamically load Flutterwave inline script
  if (typeof window === 'undefined') return;

  const existingScript = document.querySelector(
    'script[src="https://checkout.flutterwave.com/v3.js"]'
  );

  const initPayment = () => {
    const FlutterwaveCheckout = (window as any).FlutterwaveCheckout;
    if (FlutterwaveCheckout) {
      FlutterwaveCheckout(config);
    } else {
      console.error('FlutterwaveCheckout not found');
    }
  };

  if (existingScript) {
    initPayment();
  } else {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = initPayment;
    document.head.appendChild(script);
  }
}

export async function verifyPayment(transactionId: number): Promise<boolean> {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });
    const data = await response.json();
    return data.verified;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}