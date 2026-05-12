import { create } from "zustand";
import type { User } from "firebase/auth";

type AuthStore = {
  user: User | null;
  isAuthReady: boolean;

  setUser: (user: User | null) => void;
  setIsAuthReady: (isAuthReady: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthReady: false,

  setUser: (user) => {
    set({ user });
  },

  setIsAuthReady: (isAuthReady) => {
    set({ isAuthReady });
  },
}));
