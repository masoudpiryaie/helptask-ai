"use client";

import { useEffect } from "react";
import { useAuthStore } from "lib/stores/auth-store";
import { useProgressStore } from "lib/stores/progress-store";
import { subscribeToUserFocusSessions } from "lib/firebase/focus-session-service";

type FirebaseProgressSyncProviderProps = {
  children: React.ReactNode;
};

export function FirebaseProgressSyncProvider({
  children,
}: FirebaseProgressSyncProviderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  const setFocusSessions = useProgressStore((state) => state.setFocusSessions);
  const setIsProgressSyncReady = useProgressStore(
    (state) => state.setIsProgressSyncReady,
  );

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      setIsProgressSyncReady(true);
      return;
    }

    const unsubscribe = subscribeToUserFocusSessions(user.uid, {
      onFocusSessionsChange: (sessions) => {
        setFocusSessions(sessions);
        setIsProgressSyncReady(true);
      },
      onError: (error) => {
        console.error("Progress sync error:", error);
        setIsProgressSyncReady(true);
      },
    });

    return () => unsubscribe();
  }, [user, isAuthReady, setFocusSessions, setIsProgressSyncReady]);

  return <>{children}</>;
}
