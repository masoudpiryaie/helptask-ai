"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { firebaseAuth } from "lib/firebase/firebase-client";
import { useAuthStore } from "lib/stores/auth-store";
import type { ReactNode } from "react";

type FirebaseAuthProviderProps = {
  children: ReactNode;
};

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthReady = useAuthStore((state) => state.setIsAuthReady);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        setUser(user);
        setIsAuthReady(true);
        return;
      }

      try {
        const credential = await signInAnonymously(firebaseAuth);
        setUser(credential.user);
      } catch (error) {
        console.error("Firebase anonymous auth error:", error);
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, setIsAuthReady]);

  return <>{children}</>;
}
