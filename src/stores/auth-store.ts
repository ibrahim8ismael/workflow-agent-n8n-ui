"use client";

import { create } from "zustand";
import { setAccessToken } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  signIn: (user: User, token: string) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  signIn: (user, token) => {
    setAccessToken(token);
    set({ user, status: "authenticated" });
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    setAccessToken(null);
    set({ user: null, status: "unauthenticated" });
  },
}));
