"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/enhanced/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validate = (): boolean => {
    const newErrors = { email: "", password: "" };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await login(formData.email.trim(), formData.password);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col px-6 py-8"
    >
      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center text-sm text-gray-500 hover:text-brand-purple transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center overflow-hidden">
          <Image
            src="/images/logo.png"
            alt="BetterME"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading font-bold mb-1">
          Welcome Back
        </h1>
        <p className="text-sm text-gray-500">
          Login to continue your journey
        </p>
      </div>

      {/* ✅ FORM WITHOUT flex-1 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          error={errors.email}
          icon={<Mail className="w-5 h-5" />}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            error={errors.password}
            icon={<Lock className="w-5 h-5" />}
            autoComplete="current-password"
          />

          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-brand-purple hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* ✅ LOGIN BUTTON NOW VISIBLE */}
        <div className="pt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Login
          </Button>
        </div>
      </form>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-purple hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </motion.div>
  );
}