"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileMenu() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!userProfile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-brand-purple text-white flex items-center justify-center font-semibold"
      >
        {userProfile.displayName?.charAt(0)?.toUpperCase() || "U"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-surface shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-brand-surface-light z-50"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-brand-surface-light">
              <p className="text-sm font-semibold">
                {userProfile.displayName}
              </p>
              <p className="text-xs text-gray-500">
                {userProfile.email}
              </p>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-brand-surface-light"
            >
              <User className="w-4 h-4" />
              Profile
            </button>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/settings");
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-brand-surface-light"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}