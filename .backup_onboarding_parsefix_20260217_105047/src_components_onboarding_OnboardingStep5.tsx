"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { UserProfile, WorkoutDuration, PreferredTime, NotificationPreferences } from "@/types";
import { DAYS_OF_WEEK, WORKOUT_DURATIONS, WORKOUT_TIMES } from "@/constants";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Props {
  data: Partial<UserProfile>;
  updateData: (data: Partial<UserProfile>) => void;
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}

export default function OnboardingStep5({ data, updateData, onComplete, onBack, loading }: Props) {
  const toggleDay = (dayId: string) => {
    const current = data.workoutDays || [];
    const updated = current.includes(dayId) ? current.filter((d) => d !== dayId) : [...current, dayId];
    updateData({ workoutDays: updated.length > 0 ? updated : current });
  };

  const updateNotification = (key: keyof NotificationPreferences, value: boolean) => {
    updateData({
      notifications: {
        ...(data.notifications || {
          workoutReminders: true,
          mealReminders: true,
          waterReminders: true,
          progressSummary: true,
          motivational: true,
        }),
        [key]: value,
      },
    });
  };

  const isValid = (data.workoutDays?.length || 0) > 0 && !!data.workoutDuration && !!data.preferredTime;

  const goalLabel = data.goal ? String(data.goal).replace(/_/g, " ") : "your goal";
  const expLabel = data.experienceLevel ? String(data.experienceLevel).replace(/_/g, " ") : "beginner";
  const dietLabel =
    !data.dietaryPreference || data.dietaryPreference === "none" ? "No restrictions" : String(data.dietaryPreference);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold mb-2">Almost There! ✨</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Let&apos;s plan your week and set up reminders</p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-4">
        {/* Workout Days */}
        <div>
          <label className="input-label">Workout Days</label>
          <p className="text-xs text-gray-400 mb-2">Tap the days you can work out</p>
          <div className="flex gap-1.5">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => toggleDay(day.id)}
                className={lex-1 py-3 rounded-2xl text-xs font-bold transition-all }
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-brand-purple dark:text-brand-lavender mt-1.5 font-medium">
            {data.workoutDays?.length || 0} days selected
          </p>
        </div>

        {/* Workout Duration */}
        <div>
          <label className="input-label">Time Per Workout</label>
          <div className="flex flex-wrap gap-2">
            {WORKOUT_DURATIONS.map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => updateData({ workoutDuration: dur.id as WorkoutDuration })}
                className={px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all }
              >
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Time */}
        <div>
          <label className="input-label">Preferred Workout Time</label>
          <div className="grid grid-cols-2 gap-2">
            {WORKOUT_TIMES.map((time) => (
              <button
                key={time.id}
                type="button"
                onClick={() => updateData({ preferredTime: time.id as PreferredTime })}
                className={lex flex-col items-center p-3 rounded-2xl border-2 transition-all }
              >
                <span className="text-xl mb-0.5">{time.icon}</span>
                <span className="text-xs font-semibold">{time.label}</span>
                <span className="text-[10px] text-gray-400">{time.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <label className="input-label mb-3">Notifications</label>
          <div className="card space-y-4">
            <Toggle
              label="⏰ Workout Reminders"
              description="Get reminded when it's time to work out"
              checked={data.notifications?.workoutReminders ?? true}
              onCheckedChange={(v) => updateNotification("workoutReminders", v)}
            />
            <div className="divider !my-2" />
            <Toggle
              label="🍽️ Meal Reminders"
              description="Don't forget to log your meals"
              checked={data.notifications?.mealReminders ?? true}
              onCheckedChange={(v) => updateNotification("mealReminders", v)}
            />
            <div className="divider !my-2" />
            <Toggle
              label="💧 Water Reminders"
              description="Stay hydrated throughout the day"
              checked={data.notifications?.waterReminders ?? true}
              onCheckedChange={(v) => updateNotification("waterReminders", v)}
            />
            <div className="divider !my-2" />
            <Toggle
              label="📊 Daily Progress"
              description="Evening summary of your day"
              checked={data.notifications?.progressSummary ?? true}
              onCheckedChange={(v) => updateNotification("progressSummary", v)}
            />
            <div className="divider !my-2" />
            <Toggle
              label="💪 Motivational"
              description="Inspiring messages to keep you going"
              checked={data.notifications?.motivational ?? true}
              onCheckedChange={(v) => updateNotification("motivational", v)}
            />
          </div>
        </div>

        {/* Summary Preview */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-brand rounded-3xl p-5 text-white">
          <h3 className="font-heading font-bold text-lg mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Your Plan Preview
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-80">Goal</span>
              <span className="font-semibold capitalize">{goalLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Workouts</span>
              <span className="font-semibold">{data.workoutDays?.length || 0}x per week</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Duration</span>
              <span className="font-semibold">{data.workoutDuration ? ${data.workoutDuration} min/session : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Diet</span>
              <span className="font-semibold capitalize">{dietLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-80">Experience</span>
              <span className="font-semibold capitalize">{expLabel}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={onComplete}
          disabled={!isValid}
          loading={loading}
          icon={<Sparkles className="w-5 h-5" />}
        >
          Start My Transformation!
        </Button>
      </div>
    </div>
  );
}
