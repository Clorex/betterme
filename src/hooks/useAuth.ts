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

        if (error?.code === "auth/invalid-credential" || error?.code === "auth/user-not-found") {
          toast.error("Invalid email or password.");
        } else {
          toast.error(error?.message || "Login failed. Please try again.");
        }

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

  // ✅ Added back for Verify Email page
  const resendVerification = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("No user session found. Please log in again.");
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      await sendEmailVerification(currentUser);
      toast.success("Verification email resent!");
    } catch (error: any) {
      console.error("Resend verification error:", error);
      if (error?.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait a bit and try again.");
      } else {
        toast.error(error?.message || "Failed to resend verification email.");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [router, setLoading]);

  // ✅ Added back for Verify Email page
  const checkVerification = useCallback(async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    try {
      await currentUser.reload();
      return currentUser.emailVerified;
    } catch (e) {
      return false;
    }
  }, []);

  /**
   * Time-bounded onboarding completion:
   * - Optimistically sets onboardingCompleted=true in local store immediately
   * - Attempts Firestore write + refresh, but returns within ~3 seconds.
   */
  const completeOnboarding = useCallback(
    async (onboardingData: Partial<UserProfile>) => {
      setLoading(true);

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        toast.error("No user logged in.");
        throw new Error("No user logged in");
      }

      const weight =
        onboardingData.weightUnit === "lbs"
          ? (onboardingData.currentWeight || 0) / 2.20462
          : onboardingData.currentWeight || 0;

      const height = onboardingData.height || 0;
      const age = onboardingData.age || 0;
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

      // Optimistic local update
      setProfile({ ...(userProfile?.profile ?? userProfile ?? {}), ...fullProfile });

      const work = (async () => {
        try {
          await setDoc(doc(db, "users", currentUser.uid), fullProfile, { merge: true });
          const updated = await fetchProfile(currentUser.uid);
          if (updated) setProfile(updated);
        } catch (e) {
          console.error("Onboarding save error:", e);
        }
      })();

      await Promise.race([work, new Promise((resolve) => setTimeout(resolve, 3000))]);

      toast.success("Profile set up successfully!");
      setLoading(false);
    },
    [setLoading, fetchProfile, setProfile, userProfile]
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
    resendVerification,
    checkVerification,
    completeOnboarding,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified || false,
    isOnboardingCompleted:
      userProfile?.onboardingCompleted ?? userProfile?.profile?.onboardingCompleted ?? false,
    isAdmin: (userProfile?.role ?? userProfile?.profile?.role) === "admin",
  };
}
