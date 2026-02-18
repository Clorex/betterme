"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { UserProfile, GoalType } from "@/types";
import { GOALS } from "@/constants";
import { ArrowRight } from "lucide-react";

interface Props {
  data: Partial<UserProfile>;
  updateData: (data: Partial<UserProfile>) => void;
  onNext: () => void;
}

export default function OnboardingStep1({ data, updateData, onNext }: Props) {
  const handleSelect = (goalId: string) => {
    updateData({ goal: goalId as GoalType });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold mb-2">
          What&apos;s your goal? 🎯
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Choose your primary transformation goal. This personalizes everything
          in the app for you.
        </p>
      </div>

      {/* Goal Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-4">
        {GOALS.map((goal, index) => (
          <motion.button
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            onClick={() => handleSelect(goal.id)}
            className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
              data.goal === goal.id
                ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20 shadow-glow"
                : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender dark:hover:border-brand-purple/50 bg-white dark:bg-brand-surface"
            }`}
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                data.goal === goal.id
                  ? "bg-brand-purple/10 dark:bg-brand-lavender/20"
                  : "bg-gray-100 dark:bg-brand-surface-light"
              }`}
            >
              {goal.icon}
            </div>

            {/* Text */}
            <div className="ml-4 flex-1">
              <h3
                className={`font-heading font-bold text-base ${
                  data.goal === goal.id
                    ? "text-brand-purple dark:text-brand-lavender"
                    : ""
                }`}
              >
                {goal.label}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {goal.description}
              </p>
            </div>

            {/* Check */}
            {data.goal === goal.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-brand-purple dark:bg-brand-lavender flex items-center justify-center shrink-0"
              >
                <svg
                  className="w-4 h-4 text-white dark:text-brand-dark"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Next Button */}
      <div className="pt-4">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onNext}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}