// src/hooks/useAuth.ts
"use client";

import { useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { UserProfile } from "@/types";
import {
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateMacros,
  calculateBMI,
  getBMICategory,
  calculateWaterIntake,
} from "@/lib/utils";
import { TRIAL_DURATION_HOURS } from "@/constants";

export function useAuth() {
  const router = useRouter();

  const {
    user,
    userProfile,
    loading,
    initialized,
    setUser,
    setProfile,
    setLoading,
    fetchProfile,
    clearAuth,
  } = useAuthStore();

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        setLoading(true);

        const credential = await createUserWithEmailAndPassword(auth, email, password);

        await updateProfile(credential.user, { displayName: fullName });
        await sendEmailVerification(credential.user);

        const initialProfile: Partial<UserProfile> = {
          uid: credential.user.uid,
          email,
          displayName: fullName,
          photoURL: "",
          role: email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "user",
          onboardingCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subscription: {
            plan: "free",
            status: "active",
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            trialUsed: false,
          },
          streaks: {
            current: 0,
            longest: 0,
            lastActiveDate: "",
          },
        };

        await setDoc(doc(db, "users", credential.user.uid), initialProfile);

        // update local state immediately
        setUser(credential.user);
        setProfile(initialProfile);

        toast.success("Account created! Please verify your email.");
        router.push("/verify-email");
      } catch (error: any) {
        console.error("Registration error:", error);

        if (error?.code === "auth/email-already-in-use") toast.error("An account with this email already exists.");
        else if (error?.code === "auth/weak-password") toast.error("Password is too weak. Use at least 8 characters.");
        else if (error?.code === "auth/invalid-email") toast.error("Invalid email address.");
        else toast.error(error?.message || "Registration failed. Please try again.");

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, setUser, setProfile]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);

        const credential = await signInWithEmailAndPassword(auth, email, password);

        if (!credential.user.emailVerified) {
          toast.error("Please verify your email first.");
          await signOut(auth);
          router.push("/verify-email");
          return;
        }

        const profile = await fetchProfile(credential.user.uid);

        if (profile?.onboardingCompleted) router.push("/dashboard");
        else router.push("/onboarding");
      } catch (error: any) {
        console.error("Login error:", error);

        if (error?.code === "auth/invalid-credential" || error?.code === "auth/user-not-found")
          toast.error("Invalid email or password.");
        else toast.error(error?.message || "Login failed. Please try again.");

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, fetchProfile]
  );

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      clearAuth();
      router.push("/");
    } catch (e) {
      console.error("Logout error:", e);
      toast.error("Logout failed.");
    }
  }, [router, clearAuth]);

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        await sendPasswordResetEmail(auth, email);
        toast.success("Password reset link sent to your email!");
      } catch (error: any) {
        console.error("Forgot password error:", error);
        toast.error(error?.message || "Failed to send reset email.");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const completeOnboarding = useCallback(
    async (onboardingData: Partial<UserProfile>) => {
      try {
        setLoading(true);

        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("No user logged in");

        const weight =
          onboardingData.weightUnit === "lbs"
            ? (onboardingData.currentWeight || 70) / 2.20462
            : onboardingData.currentWeight || 70;

        const height = onboardingData.height || 170;
        const age = onboardingData.age || 25;
        const gender = onboardingData.gender || "other";
        const activityLevel = onboardingData.activityLevel || "moderately_active";
        const goal = onboardingData.goal || "general_fitness";

        const bmr = calculateBMR(weight, height, age, gender);
        const tdee = calculateTDEE(bmr, activityLevel);
        const dailyCalories = calculateDailyCalories(tdee, goal);
        const macros = calculateMacros(dailyCalories, goal);
        const bmi = calculateBMI(weight, height);
        const bmiCategory = getBMICategory(bmi);
        const waterGoal = calculateWaterIntake(weight, activityLevel);

        const trialEndDate = new Date();
        trialEndDate.setHours(trialEndDate.getHours() + TRIAL_DURATION_HOURS);

        const fullProfile: Partial<UserProfile> = {
          ...onboardingData,
          onboardingCompleted: true,
          bmr,
          tdee,
          dailyCalories,
          macros,
          bmi,
          bmiCategory,
          waterGoal,
          subscription: {
            plan: "trial",
            status: "active",
            startDate: new Date().toISOString(),
            endDate: trialEndDate.toISOString(),
            trialUsed: true,
          },
          streaks: {
            current: 1,
            longest: 1,
            lastActiveDate: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, "users", currentUser.uid), fullProfile, { merge: true });

        const updated = await fetchProfile(currentUser.uid);
        setProfile(updated);

        toast.success("Profile set up successfully!");
        router.push("/dashboard");
      } catch (e) {
        console.error("Onboarding error:", e);
        toast.error("Failed to save profile. Please try again.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [router, setLoading, fetchProfile, setProfile]
  );

  return {
    user,
    userProfile,
    loading,
    initialized,
    register,
    login,
    logout,
    forgotPassword,
    completeOnboarding,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    isOnboardingCompleted:
      userProfile?.onboardingCompleted ?? userProfile?.profile?.onboardingCompleted ?? false,
    isAdmin: (userProfile?.role ?? userProfile?.profile?.role) === "admin",
  };
}