"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loading } from "@/components/ui/Loading";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/verify-email"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, userProfile, initialized } = useAuthStore();

  const isEmailVerified = user?.emailVerified ?? false;
  const onboardingCompleted =
    userProfile?.onboardingCompleted ?? userProfile?.profile?.onboardingCompleted ?? false;
  const role = userProfile?.role ?? userProfile?.profile?.role ?? "user";

  useEffect(() => {
    if (!initialized) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (user && !isEmailVerified && pathname !== "/verify-email") {
      router.replace("/verify-email");
      return;
    }

    if (user && isEmailVerified && userProfile) {
      if (!onboardingCompleted && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }

      // IMPORTANT: do NOT include "/onboarding" here, otherwise it will instantly redirect
      // and you won't see the completion loading screen.
      if (
        onboardingCompleted &&
        (pathname === "/login" || pathname === "/register" || pathname === "/")
      ) {
        router.replace("/dashboard");
        return;
      }
    }

    if (pathname.startsWith("/admin") && role !== "admin") {
      router.replace("/dashboard");
    }
  }, [initialized, pathname, router, user, userProfile, onboardingCompleted, role, isEmailVerified]);

  if (!initialized) {
    return <Loading fullScreen text="Loading BetterME..." />;
  }

  return <>{children}</>;
}
