// src/store/authStore.ts
import { create } from "zustand";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  initialized: boolean;

  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;

  clearAuth: () => void;

  fetchProfile: (userId: string) => Promise<any | null>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
}

function normalizeUserProfile(data: any): any {
  if (!data) return null;
  // If already has "profile", keep as-is
  if (data.profile) return data;
  // Otherwise, create a compatibility alias so code using userProfile.profile.* works
  return { ...data, profile: data };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ userProfile: normalizeUserProfile(profile) }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  clearAuth: () =>
    set({
      user: null,
      userProfile: null,
      loading: false,
      initialized: true,
    }),

  fetchProfile: async (userId: string) => {
    set({ loading: true });
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const normalized = normalizeUserProfile(userDoc.data());
        set({ userProfile: normalized, loading: false });
        return normalized;
      }
      set({ userProfile: null, loading: false });
      return null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      set({ loading: false });
      return null;
    }
  },

  updateProfile: async (data) => {
    const { user, userProfile } = get();
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      // Update local store + keep profile alias in sync
      const current = userProfile ?? {};
      const currentProfile = current.profile ?? current;

      const next = {
        ...current,
        ...data,
        profile: {
          ...currentProfile,
          ...data,
        },
      };

      set({ userProfile: next });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  },
}));