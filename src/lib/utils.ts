// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ActivityLevel, GoalType, MacroTargets } from "@/types";

// ========================================
// CLASS NAME MERGER
// ========================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========================================
// DATE FORMATTERS
// ========================================
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function getDayOfWeek(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(date);
}

// ========================================
// NUMBER FORMATTERS
// ========================================
export function formatCalories(cal: number): string {
  return Math.round(cal).toLocaleString();
}

export function formatWeight(weight: number, unit: "kg" | "lbs"): string {
  return `${weight.toFixed(1)} ${unit}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// ========================================
// BODY CALCULATIONS
// ========================================
export function calculateBMR(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: "male" | "female" | "other"
): number {
  // Mifflin-St Jeor Equation
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "male") return Math.round(base + 5);
  if (gender === "female") return Math.round(base - 161);
  return Math.round(base - 78); // average for "other"
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}

export function calculateDailyCalories(tdee: number, goal: GoalType): number {
  const adjustments: Record<GoalType, number> = {
    fat_loss: -500,
    muscle_gain: 300,
    get_lean: -300,
    body_recomp: -100,
    strength: 200,
    general_fitness: 0,
  };
  return Math.round(tdee + adjustments[goal]);
}

export function calculateMacros(dailyCalories: number, goal: GoalType): MacroTargets {
  const ratios: Record<GoalType, { protein: number; carbs: number; fat: number }> = {
    fat_loss: { protein: 0.4, carbs: 0.3, fat: 0.3 },
    muscle_gain: { protein: 0.3, carbs: 0.45, fat: 0.25 },
    get_lean: { protein: 0.35, carbs: 0.35, fat: 0.3 },
    body_recomp: { protein: 0.4, carbs: 0.35, fat: 0.25 },
    strength: { protein: 0.3, carbs: 0.4, fat: 0.3 },
    general_fitness: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  };

  const ratio = ratios[goal];
  return {
    protein: Math.round((dailyCalories * ratio.protein) / 4),
    carbs: Math.round((dailyCalories * ratio.carbs) / 4),
    fat: Math.round((dailyCalories * ratio.fat) / 9),
  };
}

/**
 * Legacy-compatible version that returns calories alongside macros.
 * Useful for components that expect { calories, protein, carbs, fat }.
 */
export function calculateMacrosWithCalories(
  tdee: number,
  goal: GoalType
): MacroTargets & { calories: number } {
  const dailyCalories = calculateDailyCalories(tdee, goal);
  const macros = calculateMacros(dailyCalories, goal);
  return { calories: dailyCalories, ...macros };
}

export function calculateBMI(weight: number, height: number): number {
  const heightM = height / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export function calculateWaterIntake(weight: number, activityLevel: ActivityLevel): number {
  // Returns glasses (250ml each)
  const baseGlasses = Math.round(weight * 0.033 * 4);
  const activityBonus: Record<ActivityLevel, number> = {
    sedentary: 0,
    lightly_active: 1,
    moderately_active: 2,
    very_active: 3,
    extremely_active: 4,
  };
  return Math.min(baseGlasses + activityBonus[activityLevel], 16);
}

/**
 * Returns water intake in milliliters (used by some components).
 */
export function calculateWaterIntakeMl(weight: number, activityLevel: ActivityLevel): number {
  const mlPerKg: Record<ActivityLevel, number> = {
    sedentary: 30,
    lightly_active: 33,
    moderately_active: 35,
    very_active: 38,
    extremely_active: 40,
  };
  return Math.round(weight * mlPerKg[activityLevel]);
}

export function estimateGoalDate(
  currentWeight: number,
  targetWeight: number,
  goal: GoalType
): string {
  const diff = Math.abs(currentWeight - targetWeight);
  let weeksNeeded: number;

  if (goal === "fat_loss" || goal === "get_lean") {
    weeksNeeded = Math.ceil(diff / 0.5);
  } else if (goal === "muscle_gain") {
    weeksNeeded = Math.ceil(diff / 0.25);
  } else {
    weeksNeeded = Math.ceil(diff / 0.35);
  }

  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + weeksNeeded * 7);
  return goalDate.toISOString();
}

export function convertWeight(weight: number, from: "kg" | "lbs", to: "kg" | "lbs"): number {
  if (from === to) return weight;
  if (from === "kg" && to === "lbs") return Number((weight * 2.20462).toFixed(1));
  return Number((weight / 2.20462).toFixed(1));
}

export function convertHeight(height: number, from: "cm" | "ft", to: "cm" | "ft"): number {
  if (from === to) return height;
  if (from === "cm" && to === "ft") return Number((height / 30.48).toFixed(1));
  return Number((height * 30.48).toFixed(0));
}

// ========================================
// IMAGE UTILITIES
// ========================================
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Could not compress image"));
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

/**
 * Compress and return as a File (convenience wrapper).
 */
export async function compressImageToFile(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<File> {
  const blob = await compressImage(file, maxWidth, quality);
  return new File([blob], file.name, { type: "image/jpeg" });
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// ========================================
// ID GENERATOR
// ========================================
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ========================================
// VALIDATION
// ========================================
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

// ========================================
// STEP / ACTIVITY CALCULATIONS
// ========================================
export function calculateStepCalories(steps: number, weight: number): number {
  return Math.round(steps * 0.04 * (weight / 70));
}

export function calculateStepDistance(steps: number, height: number): number {
  const strideLength = (height * 0.415) / 100000; // km
  return Number((steps * strideLength).toFixed(2));
}