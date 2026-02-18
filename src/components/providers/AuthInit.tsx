// src/components/providers/AuthInit.tsx
"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { setUser, fetchProfile, clearAuth, setLoading, setInitialized } = useAuthStore();
  const { setGlobalLoading } = useUIStore();

  useEffect(() => {
    let mounted = true;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        setLoading(true);

        if (firebaseUser) {
          setUser(firebaseUser);
          await fetchProfile(firebaseUser.uid);
        } else {
          clearAuth();
        }
      } catch (e) {
        console.error("AuthInit error:", e);
      } finally {
        if (!mounted) return;
        setInitialized(true);
        setGlobalLoading(false);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [setUser, fetchProfile, clearAuth, setLoading, setInitialized, setGlobalLoading]);

  return <>{children}</>;
}