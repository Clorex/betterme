"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import {
  UserProfile,
  WorkoutLocation,
  Equipment,
  ExperienceLevel,
} from "@/types";
import {
  WORKOUT_LOCATIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
} from "@/constants";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  data: Partial<UserProfile>;
  updateData: (data: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingStep3({
  data,
  updateData,
  onNext,
  onBack,
}: Props) {
  const toggleLocation = (id: string) => {
    const current = data.workoutLocation || [];
    const updated = current.includes(id as WorkoutLocation)
      ? current.filter((l) => l !== id)
      : [...current, id as WorkoutLocation];
    updateData({ workoutLocation: updated.length > 0 ? updated : current });
  };

  const toggleEquipment = (id: string) => {
    const current = (data.equipment ?? []) as Equipment[];

    if (id === 'none') {
      updateData({ equipment: ['none'] as Equipment[] });
      return;
    }

    if (id === 'full_gym') {
      updateData({ equipment: ['full_gym'] as Equipment[] });
      return;
    }

    const filtered = current.filter(
      (e) => e !== 'none' && e !== 'full_gym'
    ) as Equipment[];

    let updated: Equipment[];

    if (filtered.includes(id as Equipment)) {
      updated = filtered.filter((e) => e !== id) as Equipment[];
    } else {
      updated = [...filtered, id as Equipment];
    }

    updateData({
      equipment: updated.length > 0 ? updated : (['none'] as Equipment[]),
    });
  };

  const isValid =
    (data.workoutLocation?.length || 0) > 0 &&
    (data.equipment?.length || 0) > 0 &&
    data.experienceLevel;

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold mb-2">
          Your Lifestyle 🏋️
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tell us how and where you&apos;ll train
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-4">
        {/* Workout Location */}
        <div>
          <label className="input-label">Where do you workout?</label>
          <p className="text-xs text-gray-400 mb-2">Select all that apply</p>
          <div className="grid grid-cols-2 gap-2">
            {WORKOUT_LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => toggleLocation(loc.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                  data.workoutLocation?.includes(loc.id as WorkoutLocation)
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                <span className="text-2xl mb-1">{loc.icon}</span>
                <span className="text-sm font-semibold">{loc.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div>
          <label className="input-label">Equipment Available</label>
          <p className="text-xs text-gray-400 mb-2">Select all you have</p>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map((eq) => (
              <button
                key={eq.id}
                onClick={() => toggleEquipment(eq.id)}
                className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left ${
                  data.equipment?.includes(eq.id as Equipment)
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                <span className="text-lg">{eq.icon}</span>
                <span className="text-xs font-semibold">{eq.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="input-label">Experience Level</label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() =>
                  updateData({
                    experienceLevel: level.id as ExperienceLevel,
                  })
                }
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                  data.experienceLevel === level.id
                    ? "border-brand-purple dark:border-brand-lavender bg-brand-lavender/10 dark:bg-brand-purple/20"
                    : "border-gray-200 dark:border-brand-surface-light hover:border-brand-lavender/50"
                }`}
              >
                <span className="text-xl">{level.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{level.label}</p>
                  {level.description && (
                    <p className="text-xs text-gray-500">{level.description}</p>
                  )}
                </div>
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

