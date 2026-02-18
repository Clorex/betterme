"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from '@/components/ui/Input';
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }

    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Error handled in useAuth
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
        >
          <CheckCircle2 className="w-20 h-20 text-success mb-6" />
        </motion.div>
        <h1 className="text-2xl font-heading font-bold mb-2">
          Reset Link Sent!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 max-w-[280px]">
          Check your email for a link to reset your password.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push("/login")}
        >
          Back to Login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen min-h-[100dvh] flex flex-col px-6 py-8"
    >
      {/* Back */}
      <button
        onClick={() => router.push("/login")}
        className="flex items-center text-sm text-gray-500 hover:text-brand-purple dark:hover:text-brand-lavender transition-colors mb-12"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Login
      </button>

      <div className="flex-1 flex flex-col">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-brand-lavender/20 dark:bg-brand-purple/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-brand-purple dark:text-brand-lavender" />
          </div>
        </div>

        <h1 className="text-2xl font-heading font-bold text-center mb-2">
          Forgot Password?
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
          Enter your email and we&apos;ll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            error={error}
            icon={<Mail className="w-5 h-5" />}
            autoComplete="email"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Send Reset Link
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
