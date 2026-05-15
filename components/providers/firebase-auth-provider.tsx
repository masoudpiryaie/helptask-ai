"use client";

import { useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { firebaseAuth } from "lib/firebase/firebase-client";
import { useAuthStore } from "lib/stores/auth-store";
import {
  clearPendingGoogleConnection,
  getGoogleRedirectResult,
  getPendingGoogleConnection,
} from "lib/firebase/auth-service";
import type { ReactNode } from "react";

type FirebaseAuthProviderProps = {
  children: ReactNode;
};

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthReady = useAuthStore((state) => state.setIsAuthReady);
  const setGoogleAccessToken = useAuthStore(
    (state) => state.setGoogleAccessToken,
  );
  const setIsCalendarConnected = useAuthStore(
    (state) => state.setIsCalendarConnected,
  );
  const setIsGmailConnected = useAuthStore(
    (state) => state.setIsGmailConnected,
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function setupAuth() {
      try {
        const pendingConnection = getPendingGoogleConnection();
        const redirectResult = await getGoogleRedirectResult();

        if (redirectResult) {
          setUser(redirectResult.user);

          if (redirectResult.accessToken) {
            setGoogleAccessToken(redirectResult.accessToken);
          }

          if (pendingConnection === "calendar") {
            setIsCalendarConnected(true);
          }

          if (pendingConnection === "gmail") {
            setIsGmailConnected(true);
          }

          clearPendingGoogleConnection();
        }
      } catch (error) {
        console.error("Redirect auth result error:", error);
        clearPendingGoogleConnection();
      }

      unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
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
    }

    setupAuth();

    return () => {
      unsubscribe?.();
    };
  }, [
    setUser,
    setIsAuthReady,
    setGoogleAccessToken,
    setIsCalendarConnected,
    setIsGmailConnected,
  ]);

  return <>{children}</>;
}
