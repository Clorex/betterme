"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  UserProfile,
  DietaryPreference,
  Allergy,
  MealsPerDay,
  CookingSkill,
} from "@/types";
import {
  DIETARY_PREFERENCES,
  ALLERGY_OPTIONS,
  MEALS_PER_DAY_OPTIONS,
  COOKING_SKILLS,
} from "@/constants";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  data: Partial<UserProfile>;
  updateData: (data: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStep4({
  data,
  updateData,
  onNext,
  onBack,
}: Props) {
  const toggleAllergy = (id: string) => {
    const current = (data.allergies ?? []) as Allergy[];

    if (id === 'none') {
      updateData({ allergies: ['none'] as Allergy[] });
      return;
    }

    const filtered = current.filter((a) => a !== 'none') as Allergy[];

    let updated: Allergy[];

    if (filtered.includes(id as Allergy)) {
      updated = filtered.filter((a) => a !== id) as Allergy[];
    } else {
      updated = [...filtered, id as Allergy];
    }

    updateData({
      allergies: updated.length > 0 ? updated : (['none'] as Allergy[]),
    });
  };

  const isValid =
    data.dietaryPreference &&
    (data.allergies?.length || 0) > 0 &&
    data.mealsPerDay &&
    data.cookingSkill;

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold mb-2">
          Your Nutrition 🍽️
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Let&apos;s set up your nutrition preferences
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-4">
        {/* Dietary Preference */}
        <div>
          <label className="input-label">Dietary Preference</label>
          <div className="grid grid-cols-2 gap-2">
            {DIETARY_PREFERENCES.map((pref) => (
              <button
                key={pref.id}
                onClick={() =>
                  updateData({
                    dietaryPreference: pref.id as DietaryPreference,
                  })
                }
                className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left ${
                  data.dietaryPreference === pref.id
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                <span className="text-lg">{pref.icon}</span>
                <span className="text-xs font-semibold">{pref.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label className="input-label">Food Allergies</label>
          <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((allergy) => (
              <button
                key={allergy.id}
                onClick={() => toggleAllergy(allergy.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  data.allergies?.includes(allergy.id as Allergy)
                    ? "bg-brand-purple text-white dark:bg-brand-lavender dark:text-brand-dark"
                    : "bg-gray-100 dark:bg-brand-surface-light text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                {allergy.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meals Per Day */}
        <div>
          <label className="input-label">How many meals per day?</label>
          <div className="space-y-2">
            {MEALS_PER_DAY_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  updateData({ mealsPerDay: option.id as MealsPerDay })
                }
                className={`w-full p-3 rounded-2xl border-2 transition-all text-left text-sm font-semibold ${
                  data.mealsPerDay === option.id
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cooking Skill */}
        <div>
          <label className="input-label">Cooking Skill Level</label>
          <div className="grid grid-cols-2 gap-2">
            {COOKING_SKILLS.map((skill) => (
              <button
                key={skill.id}
                onClick={() =>
                  updateData({ cookingSkill: skill.id as CookingSkill })
                }
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  data.cookingSkill === skill.id
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                <span className="text-2xl mb-1">{skill.icon}</span>
                <span className="text-xs font-semibold text-center">
                  {skill.label}
                </span>
              </button>
            ))}
          </div>
        </div>
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

