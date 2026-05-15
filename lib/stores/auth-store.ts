import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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

  clearGoogleConnections: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
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

      clearGoogleConnections: () => {
        set({
          googleAccessToken: null,
          isCalendarConnected: false,
          isGmailConnected: false,
        });
      },
    }),
    {
      name: "mindtask-ai-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        googleAccessToken: state.googleAccessToken,
        isCalendarConnected: state.isCalendarConnected,
        isGmailConnected: state.isGmailConnected,
      }),
    },
  ),
);
