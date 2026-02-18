'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, Crown, Sparkles, Zap, Shield,
  CreditCard, Loader2, ArrowRight, Star
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  SUBSCRIPTION_PLANS, PlanId, generateTxRef,
  getPrice, getCurrency, initializeFlutterwavePayment,
  verifyPayment
} from '@/lib/flutterwave';
import {
  doc, updateDoc, addDoc, collection, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialExpired?: boolean;
}

export default function PaymentModal({ isOpen, onClose, trialExpired = false }: PaymentModalProps) {
  const { user, userProfile } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro_monthly');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [processing, setProcessing] = useState(false);

  const currency = getCurrency();

  const handlePayment = async () => {
    if (!user || !userProfile) {
      toast.error('Please login first');
      return;
    }

    setProcessing(true);

    const plan = SUBSCRIPTION_PLANS[selectedPlan];
    const amount = getPrice(selectedPlan, currency);
    const txRef = generateTxRef();

    initializeFlutterwavePayment({
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
      tx_ref: txRef,
      amount,
      currency,
      payment_options: 'card, banktransfer, mobilemoney, ussd',
      customer: {
        email: user.email || '',
        name: userProfile.displayName || '',
      },
      customizations: {
        title: 'BetterME Subscription',
        description: `${plan.name} Plan`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/images/logo.png`,
      },
      callback: async (response) => {
        if (response.status === 'successful') {
          try {
            // Verify payment
            const verified = await verifyPayment(response.transaction_id);

            if (verified) {
              // Update user subscription
              const endDate = new Date();
              if (billingCycle === 'monthly') {
                endDate.setDate(endDate.getDate() + 30);
              } else {
                endDate.setDate(endDate.getDate() + 365);
              }

              await updateDoc(doc(db, 'users', user.uid), {
                subscription: {
                  plan: plan.plan,
                  status: 'active',
                  startDate: new Date(),
                  endDate,
                  paymentRef: response.flw_ref,
                  txRef,
                  planId: selectedPlan,
                },
              });

              // Record transaction
              await addDoc(collection(db, 'transactions'), {
                type: 'subscription',
                amount: response.charged_amount,
                currency: response.currency,
                userId: user.uid,
                userEmail: user.email,
                userName: userProfile.displayName,
                plan: plan.plan,
                planId: selectedPlan,
                status: 'completed',
                reference: response.flw_ref,
                txRef,
                transactionId: response.transaction_id,
                date: serverTimestamp(),
              });

              // Update admin wallet
              try {
                const { increment } = await import('firebase/firestore');
                await updateDoc(doc(db, 'admin', 'wallet'), {
                  totalRevenue: increment(response.charged_amount),
                  availableBalance: increment(response.charged_amount),
                  monthlyRevenue: increment(response.charged_amount),
                });
              } catch {
                // Wallet doc might not exist yet
              }

              toast.success('🎉 Subscription activated! Welcome to Pro!');
              onClose();

              // Refresh the page to update subscription state
              window.location.reload();
            } else {
              toast.error('Payment verification failed. Contact support.');
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Something went wrong. Please contact support.');
          }
        } else {
          toast.error('Payment was not successful. Please try again.');
        }
        setProcessing(false);
      },
      onclose: () => {
        setProcessing(false);
      },
    });
  };

  const displayPlans = billingCycle === 'monthly'
    ? (['pro_monthly', 'premium_monthly'] as PlanId[])
    : (['pro_annual', 'premium_annual'] as PlanId[]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={trialExpired ? undefined : onClose}
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-brand-surface rounded-t-3xl max-h-[95vh] overflow-y-auto"
          >
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div />
                {!trialExpired && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                )}
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Crown size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-montserrat font-bold text-brand-dark dark:text-brand-white">
                  {trialExpired ? 'Your Trial Has Ended' : 'Upgrade to Pro'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Unlock your full transformation potential
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1 flex">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-white dark:bg-brand-surface text-brand-dark dark:text-brand-white shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all relative ${
                      billingCycle === 'annual'
                        ? 'bg-white dark:bg-brand-surface text-brand-dark dark:text-brand-white shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    Annual
                    <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded-full">
                      -33%
                    </span>
                  </button>
                </div>
              </div>

              {/* Plans */}
              <div className="space-y-4 mb-6">
                {displayPlans.map((planId) => {
                  const plan = SUBSCRIPTION_PLANS[planId];
                  const price = getPrice(planId, currency);
                  const isSelected = selectedPlan === planId;
                  const isPremium = plan.plan === 'premium';

                  return (
                    <button
                      key={planId}
                      onClick={() => setSelectedPlan(planId)}
                      className={`w-full text-left rounded-2xl p-4 border-2 transition-all relative ${
                        isSelected
                          ? 'border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {isPremium && (
                        <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-gradient-to-r from-brand-purple to-purple-600 text-white text-[10px] font-bold rounded-full flex items-center gap-0.5">
                          <Star size={8} className="fill-white" />
                          BEST VALUE
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-brand-dark dark:text-brand-white">
                            {plan.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {plan.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-brand-dark dark:text-brand-white">
                            {currency === 'NGN' ? '₦' : '$'}
                            {price.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            /{plan.interval === 'annual' ? 'year' : 'month'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 mt-3">
                        {plan.features.slice(0, 4).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <Check size={12} className="text-green-500 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Selection indicator */}
                      <div
                        className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-brand-purple bg-brand-purple'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-brand-purple to-purple-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={18} />
                    Subscribe Now - {currency === 'NGN' ? '₦' : '$'}
                    {getPrice(selectedPlan, currency).toLocaleString()}
                    /{SUBSCRIPTION_PLANS[selectedPlan].interval === 'annual' ? 'yr' : 'mo'}
                  </>
                )}
              </button>

              <div className="text-center mt-3 space-y-1">
                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                  <Shield size={10} />
                  Secured by Flutterwave. Cancel anytime.
                </p>
                <p className="text-[10px] text-gray-400">
                  By subscribing, you agree to our Terms of Service
                </p>
              </div>
            </div>

            <div className="h-8" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}