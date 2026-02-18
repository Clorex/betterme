"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "success" | "warning" | "error" | "default";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    purple: "badge-purple",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    default: "badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span className={cn(variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}