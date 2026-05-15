import { create } from "zustand";
import type { User } from "firebase/auth";

type AuthStore = {
  user: User | null;
  isAuthReady: boolean;

  googleAccessToken: string | null;
  isCalendarConnected: boolean;
  isGmailConnected: boolean;

  setUser: (user: User | null) => void;
  setIsAuthReady: (isAuthReady: boolean) => void;

  setGoogleAccessToken: (token: string | null) => void;
  setIsCalendarConnected: (isConnected: boolean) => void;
  setIsGmailConnected: (isConnected: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthReady: false,

  googleAccessToken: null,
  isCalendarConnected: false,
  isGmailConnected: false,

  setUser: (user) => {
    set({ user });
  },

  setIsAuthReady: (isAuthReady) => {
    set({ isAuthReady });
  },

  setGoogleAccessToken: (token) => {
    set({ googleAccessToken: token });
  },

  setIsCalendarConnected: (isConnected) => {
    set({ isCalendarConnected: isConnected });
  },

  setIsGmailConnected: (isConnected) => {
    set({ isGmailConnected: isConnected });
  },
}));
