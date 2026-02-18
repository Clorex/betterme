"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, resendVerification, checkVerification, loading } = useAuth();
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  // Auto-check verification every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const isVerified = await checkVerification();
      if (isVerified) {
        setVerified(true);
        clearInterval(interval);
        setTimeout(() => {
          router.push("/onboarding");
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkVerification, router]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    await resendVerification();
    setCooldown(60);
  };

  const handleCheck = async () => {
    setChecking(true);
    const isVerified = await checkVerification();
    if (isVerified) {
      setVerified(true);
      setTimeout(() => {
        router.push("/onboarding");
      }, 2000);
    } else {
      setChecking(false);
    }
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.2 }}
        >
          <CheckCircle2 className="w-24 h-24 text-success mb-6" />
        </motion.div>
        <h1 className="text-2xl font-heading font-bold mb-2">Email Verified!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Redirecting to setup your profile...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen min-h-[100dvh] flex flex-col px-6 py-8"
    >
      {/* Back */}
      <button
        onClick={() => router.push("/register")}
        className="flex items-center text-sm text-gray-500 hover:text-brand-purple dark:hover:text-brand-lavender transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Email Icon Animation */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-brand-lavender/20 dark:bg-brand-purple/30 flex items-center justify-center">
            <Mail className="w-12 h-12 text-brand-purple dark:text-brand-lavender" />
          </div>
        </motion.div>

        <h1 className="text-2xl font-heading font-bold mb-2">
          Check Your Email
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          We&apos;ve sent a verification link to
        </p>
        <p className="text-brand-purple dark:text-brand-lavender font-semibold mb-8">
          {user?.email || "your email"}
        </p>

        {/* Actions */}
        <div className="w-full space-y-3 max-w-[300px]">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleCheck}
            loading={checking}
          >
            I&apos;ve Verified My Email
          </Button>

          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleResend}
            disabled={cooldown > 0}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend Verification Email"}
          </Button>
        </div>

        {/* Auto-check note */}
        <p className="text-xs text-gray-400 mt-8 max-w-[250px]">
          We&apos;re automatically checking for verification. Once you verify, you&apos;ll be
          redirected automatically.
        </p>
      </div>
    </motion.div>
  );
}