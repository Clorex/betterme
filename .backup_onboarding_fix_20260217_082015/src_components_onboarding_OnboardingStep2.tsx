"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { UserProfile, ActivityLevel } from "@/types";
import { ACTIVITY_LEVELS } from "@/constants";
import {
  ArrowRight,
  ArrowLeft,
  Ruler,
  Weight,
  Target,
  Calendar,
} from "lucide-react";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
} from "@/lib/utils";

interface Props {
  data: Partial<UserProfile>;
  updateData: (data: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStep2({
  data,
  updateData,
  onNext,
  onBack,
}: Props) {
  const bmi = useMemo(() => {
    if (data.currentWeight && data.height) {
      const weightKg =
        data.weightUnit === "lbs"
          ? data.currentWeight / 2.20462
          : data.currentWeight;
      return calculateBMI(weightKg, data.height);
    }
    return 0;
  }, [data.currentWeight, data.height, data.weightUnit]);

  const bmiCategory = getBMICategory(bmi);

  const estimatedCalories = useMemo(() => {
    if (
      data.currentWeight &&
      data.height &&
      data.age &&
      data.gender &&
      data.activityLevel &&
      data.goal
    ) {
      const weightKg =
        data.weightUnit === "lbs"
          ? data.currentWeight / 2.20462
          : data.currentWeight;
      const bmr = calculateBMR(weightKg, data.height, data.age, data.gender);
      const tdee = calculateTDEE(bmr, data.activityLevel);
      return calculateDailyCalories(tdee, data.goal);
    }
    return 0;
  }, [data]);

  const isValid =
    data.gender &&
    data.age &&
    data.age >= 16 &&
    data.age <= 100 &&
    data.height &&
    data.height > 0 &&
    data.currentWeight &&
    data.currentWeight > 0 &&
    data.targetWeight &&
    data.targetWeight > 0 &&
    data.activityLevel;

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold mb-2">
          About You 📋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tell us about yourself so we can create your perfect plan
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-5 overflow-y-auto no-scrollbar pb-4">
        {/* Gender */}
        <div>
          <label className="input-label">Gender</label>
          <div className="flex gap-2">
            {[
              { id: "male", label: "👨 Male" },
              { id: "female", label: "👩 Female" },
              { id: "other", label: "⚧ Other" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  updateData({
                    gender: option.id as "male" | "female" | "other",
                  })
                }
                className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  data.gender === option.id
                    ? "bg-brand-purple text-white shadow-md"
                    : "bg-gray-100 dark:bg-brand-surface-light text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-brand-surface"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Age
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                updateData({ age: Math.max(16, (data.age || 25) - 1) })
              }
              className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-brand-surface-light flex items-center justify-center text-xl font-bold hover:bg-gray-200 dark:hover:bg-brand-surface transition-colors"
            >
              −
            </button>
            <input
              type="number"
              value={data.age || 25}
              onChange={(e) =>
                updateData({
                  age: Math.min(100, Math.max(16, parseInt(e.target.value) || 16)),
                })
              }
              className="input text-center text-2xl font-heading font-bold no-spin flex-1"
              min={16}
              max={100}
            />
            <button
              onClick={() =>
                updateData({ age: Math.min(100, (data.age || 25) + 1) })
              }
              className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-brand-surface-light flex items-center justify-center text-xl font-bold hover:bg-gray-200 dark:hover:bg-brand-surface transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Ruler className="w-4 h-4" /> Height
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.height || 170}
              onChange={(e) =>
                updateData({ height: parseInt(e.target.value) || 0 })
              }
              className="input text-center text-xl font-heading font-bold no-spin flex-1"
              placeholder="170"
            />
            <div className="flex bg-gray-100 dark:bg-brand-surface-light rounded-2xl p-1">
              <button
                onClick={() => updateData({ heightUnit: "cm" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  data.heightUnit === "cm"
                    ? "bg-brand-purple text-white"
                    : "text-gray-500"
                }`}
              >
                cm
              </button>
              <button
                onClick={() => updateData({ heightUnit: "ft" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  data.heightUnit === "ft"
                    ? "bg-brand-purple text-white"
                    : "text-gray-500"
                }`}
              >
                ft
              </button>
            </div>
          </div>
        </div>

        {/* Current Weight */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Weight className="w-4 h-4" /> Current Weight
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={data.currentWeight || 70}
              onChange={(e) =>
                updateData({
                  currentWeight: parseFloat(e.target.value) || 0,
                })
              }
              className="input text-center text-xl font-heading font-bold no-spin flex-1"
              step="0.1"
            />
            <div className="flex bg-gray-100 dark:bg-brand-surface-light rounded-2xl p-1">
              <button
                onClick={() => updateData({ weightUnit: "kg" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  data.weightUnit === "kg"
                    ? "bg-brand-purple text-white"
                    : "text-gray-500"
                }`}
              >
                kg
              </button>
              <button
                onClick={() => updateData({ weightUnit: "lbs" })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  data.weightUnit === "lbs"
                    ? "bg-brand-purple text-white"
                    : "text-gray-500"
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Target Weight */}
        <div>
          <label className="input-label flex items-center gap-2">
            <Target className="w-4 h-4" /> Target Weight
          </label>
          <input
            type="number"
            value={data.targetWeight || 65}
            onChange={(e) =>
              updateData({
                targetWeight: parseFloat(e.target.value) || 0,
              })
            }
            className="input text-center text-xl font-heading font-bold no-spin"
            step="0.1"
            placeholder={`Target in ${data.weightUnit || "kg"}`}
          />
        </div>

        {/* Activity Level */}
        <div>
          <label className="input-label">Activity Level</label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() =>
                  updateData({
                    activityLevel: level.id as ActivityLevel,
                  })
                }
                className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left ${
                  data.activityLevel === level.id
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold">{level.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {level.description}
                  </p>
                </div>
                {data.activityLevel === level.id && (
                  <div className="w-5 h-5 rounded-full bg-brand-purple dark:bg-brand-lavender flex items-center justify-center shrink-0">
                    <svg
                      className="w-3 h-3 text-white dark:text-brand-dark"
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
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* BMI Preview Card */}
        {bmi > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-gradient p-4"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Your Stats Preview
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400">BMI</p>
                <p className="text-lg font-heading font-bold">{bmi}</p>
                <p
                  className={`text-xs font-semibold ${
                    bmiCategory === "Normal"
                      ? "text-success"
                      : bmiCategory === "Underweight"
                      ? "text-warning"
                      : "text-error"
                  }`}
                >
                  {bmiCategory}
                </p>
              </div>
              {estimatedCalories > 0 && (
                <div>
                  <p className="text-xs text-gray-400">Daily Calories</p>
                  <p className="text-lg font-heading font-bold">
                    {estimatedCalories}
                  </p>
                  <p className="text-xs text-brand-purple dark:text-brand-lavender font-semibold">
                    Recommended
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onNext}
          disabled={!isValid}
          icon={<ArrowRight className="w-5 h-5" />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}