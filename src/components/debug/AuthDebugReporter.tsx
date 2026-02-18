"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

export default function AuthDebugReporter() {
  const { user, userProfile, loading, initialized } = useAuthStore();
  const ui = useUIStore();

  // prevent spamming requests
  const lastSentRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastSentRef.current < 1500) return; // at most once per 1.5s
    lastSentRef.current = now;

    const payload = {
      at: new Date().toISOString(),
      location: typeof window !== "undefined" ? window.location.href : null,
      auth: {
        initialized,
        loading,
        userUid: user?.uid ?? null,
        userEmail: user?.email ?? null,
        hasProfile: !!userProfile,
      },
      ui: {
        globalLoading: (ui as any).globalLoading,
      },
    };

    fetch("/api/debug/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }, [initialized, loading, user?.uid, user?.email, !!userProfile]);

  return null;
}