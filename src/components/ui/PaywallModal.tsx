// src/components/ui/PaywallModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  Zap,
  Star,
  Lock,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface PaywallModalProps {
  onClose?: () => void;
  trialEndsAt?: Date;
  dismissible?: boolean;
}

const plans = [
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '$9.99',
    priceNGN: '₦2,999',
    period: '/month',
    popular: true,
    features: [
      'AI Food Photo Analyzer',
      'Personalized Meal Plans',
      'AI Workout Generator',
      'AI Coach Chat 24/7',
      'Full Progress Tracking',
      'Community Access',
    ],
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: '$79.99',
    priceNGN: '₦29,999',
    period: '/year',
    popular: false,
    badge: 'Save 33%',
    features: [
      'Everything in Pro Monthly',
      '4 months FREE',
      'Priority Support',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: '$24.99',
    priceNGN: '₦7,999',
    period: '/month',
    popular: false,
    features: [
      'Everything in Pro',
      'Advanced Analytics',
      'Family Mode',
      'Custom Programs',
      'Export Reports',
      'Early Access Features',
    ],
  },
];

export default function PaywallModal({
  onClose,
  trialEndsAt,
  dismissible = false,
}: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('pro_monthly');
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!trialEndsAt) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = trialEndsAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Trial expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [trialEndsAt]);

  const handleSubscribe = () => {
    // TODO: Integrate with Flutterwave (Batch 10)
    console.log('Subscribe to:', selectedPlan);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[480px] overflow-hidden rounded-t-3xl bg-white dark:bg-brand-dark"
          style={{ maxHeight: '90vh' }}
        >
          {/* Close button */}
          {dismissible && onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-brand-surface"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}

          <div className="overflow-y-auto p-6" style={{ maxHeight: '90vh' }}>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-purple to-brand-lavender">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h2 className="font-heading text-2xl font-extrabold text-brand-dark dark:text-brand-white">
                {trialEndsAt && new Date() < trialEndsAt
                  ? 'Upgrade Before Trial Ends'
                  : 'Unlock Your Full Potential'}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get unlimited access to all BetterME features
              </p>

              {/* Trial countdown */}
              {timeLeft && timeLeft !== 'Trial expired' && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 dark:bg-orange-900/30">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    Trial ends in {timeLeft}
                  </span>
                </div>
              )}
            </div>

            {/* Plans */}
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={cn(
                    'relative w-full rounded-2xl border-2 p-4 text-left transition-all',
                    selectedPlan === plan.id
                      ? 'border-brand-purple bg-brand-purple/5 dark:border-brand-lavender dark:bg-brand-lavender/5'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-brand-surface'
                  )}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-brand-purple px-3 py-0.5 text-xs font-bold text-white">
                      Most Popular
                    </span>
                  )}
                  {plan.badge && (
                    <span className="absolute -top-2.5 right-4 rounded-full bg-green-500 px-3 py-0.5 text-xs font-bold text-white">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading text-base font-bold text-brand-dark dark:text-brand-white">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="text-lg font-bold text-brand-dark dark:text-brand-white">
                          {plan.price}
                        </span>
                        {plan.period}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        ({plan.priceNGN}{plan.period})
                      </p>
                    </div>

                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                        selectedPlan === plan.id
                          ? 'border-brand-purple bg-brand-purple dark:border-brand-lavender dark:bg-brand-lavender'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      {selectedPlan === plan.id && (
                        <Check className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Features list for selected */}
                  {selectedPlan === plan.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 space-y-1.5"
                    >
                      {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {f}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </button>
              ))}
            </div>

            {/* Subscribe button */}
            <Button
              onClick={handleSubscribe}
              variant="primary"
              fullWidth
              size="lg"
              className="mt-6"
            >
              <Lock className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>

            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
              Cancel anytime. No hidden fees.
              <br />
              Secure payment powered by Flutterwave.
            </p>

            <div className="pb-4" />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}