'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import OnboardingStep1 from '@/components/onboarding/OnboardingStep1';
import OnboardingStep2 from '@/components/onboarding/OnboardingStep2';
import OnboardingStep5 from '@/components/onboarding/OnboardingStep5';
import { Loading } from '@/components/ui/Loading';

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, loading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [completing, setCompleting] = useState(false);

  // No "real numbers" prefilled. Use placeholders in Step2.
  const [onboardingData, setOnboardingData] = useState<Partial<UserProfile>>({
    goal: 'fat_loss',

    gender: undefined,
    age: undefined,
    height: undefined,
    heightUnit: 'cm',

    currentWeight: undefined,
    targetWeight: undefined,
    weightUnit: 'kg',

    activityLevel: undefined,

    // keep safe defaults for other fields so app doesn't break
    workoutLocation: ['home'],
    equipment: ['none'],
    experienceLevel: 'beginner',
    dietaryPreference: 'none',
    allergies: ['none'],
    mealsPerDay: '3_meals_1_snack',
    cookingSkill: 'basic',

    // step 3 requires these
    workoutDays: [],
    workoutDuration: undefined,
    preferredTime: undefined,

    notifications: {
      workoutReminders: true,
      mealReminders: true,
      waterReminders: true,
      progressSummary: true,
      motivational: true,
    },
  });

  const updateData = (data: Partial<UserProfile>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    const started = Date.now();

    try {
      await completeOnboarding(onboardingData);
    } catch {
      setCompleting(false);
      return;
    }

    const elapsed = Date.now() - started;

    // Show a short "setting up" state, but keep it snappy.
    const minSpinnerMs = 800;
    const maxExtraDelay = 3200;

    const delay = Math.min(Math.max(0, minSpinnerMs - elapsed), maxExtraDelay);

    setTimeout(() => {
      router.replace('/dashboard');
    }, delay);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 data={onboardingData} updateData={updateData} onNext={nextStep} />;
      case 2:
        return <OnboardingStep2 data={onboardingData} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return (
          <OnboardingStep5
            data={onboardingData}
            updateData={updateData}
            onComplete={handleComplete}
            onBack={prevStep}
            loading={loading || completing}
          />
        );
      default:
        return null;
    }
  };

  if (completing) {
    return <Loading fullScreen text="Setting up your plan..." />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col px-6 py-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-xs text-brand-purple dark:text-brand-lavender font-semibold">
            {Math.round((currentStep / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-brand-surface-light rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-brand rounded-full"
            initial={{ width: 0 }}
            animate={{ width: ${(currentStep / TOTAL_STEPS) * 100}% }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
