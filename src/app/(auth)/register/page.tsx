"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { getPasswordStrength } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const passwordStrength = getPasswordStrength(formData.password);

  const strengthColors = {
    weak: "bg-error",
    medium: "bg-warning",
    strong: "bg-success",
  };

  const strengthLabels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
  };

  const passwordChecks = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "One number", met: /[0-9]/.test(formData.password) },
  ];

  const validate = (): boolean => {
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain an uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain a number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) return;

    try {
      await register(formData.email.trim(), formData.password, formData.fullName.trim());
    } catch {
      // Error handled inside useAuth
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field as keyof typeof touched]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen min-h-[100dvh] flex flex-col px-6 py-8"
    >
      <button
        onClick={() => router.push("/")}
        className="flex items-center text-sm text-gray-500 hover:text-brand-purple dark:hover:text-brand-lavender transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </button>

      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow overflow-hidden">
          <Image
            src="/images/logo.png"
            alt="BetterME"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading font-bold mb-1">Create Account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Start your transformation journey today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          onBlur={() => handleBlur("fullName")}
          error={touched.fullName ? errors.fullName : undefined}
          icon={<User className="w-5 h-5" />}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          error={touched.email ? errors.email : undefined}
          icon={<Mail className="w-5 h-5" />}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            error={touched.password ? errors.password : undefined}
            icon={<Lock className="w-5 h-5" />}
            autoComplete="new-password"
          />

          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-brand-surface-light rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColors[passwordStrength]}`}
                    style={{
                      width:
                        passwordStrength === "weak"
                          ? "33%"
                          : passwordStrength === "medium"
                          ? "66%"
                          : "100%",
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength === "weak"
                      ? "text-error"
                      : passwordStrength === "medium"
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {strengthLabels[passwordStrength]}
                </span>
              </div>

              <div className="space-y-1">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2 text-xs">
                    {check.met ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                    <span className={check.met ? "text-success" : "text-gray-400 dark:text-gray-500"}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          onBlur={() => handleBlur("confirmPassword")}
          error={touched.confirmPassword ? errors.confirmPassword : undefined}
          icon={<Lock className="w-5 h-5" />}
          autoComplete="new-password"
        />

        <div className="pt-4">
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Create Account
          </Button>
        </div>
      </form>

      <div className="text-center mt-6 pb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-purple dark:text-brand-lavender hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}