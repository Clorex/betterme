"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const { completeOnboarding, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [onboardingData, setOnboardingData] = useState<Partial<UserProfile>>({
    goal: "fat_loss",
    gender: "male",
    age: 25,
    height: 170,
    heightUnit: "cm",
    currentWeight: 70,
    targetWeight: 65,
    weightUnit: "kg",
    activityLevel: "moderately_active",
    workoutLocation: ["home"],
    equipment: ["none"],
    experienceLevel: "beginner",
    dietaryPreference: "none",
    allergies: ["none"],
    mealsPerDay: "3_meals_1_snack",
    cookingSkill: "basic",
    workoutDays: ["mon", "wed", "fri"],
    workoutDuration: "30",
    preferredTime: "morning",
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
    try {
      await completeOnboarding(onboardingData);
    } catch {
      // Error handled in useAuth
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingStep1
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <OnboardingStep2
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <OnboardingStep3
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <OnboardingStep4
            data={onboardingData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <OnboardingStep5
            data={onboardingData}
            updateData={updateData}
            onComplete={handleComplete}
            onBack={prevStep}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

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
            animate={{
              width: `${(currentStep / TOTAL_STEPS) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}