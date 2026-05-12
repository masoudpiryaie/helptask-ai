"use client";

import { useEffect } from "react";
import { useAuthStore } from "lib/stores/auth-store";
import { usePlanStore } from "lib/stores/plan-store";
import { subscribeToCurrentPlan } from "lib/firebase/ai-plan-service";

type FirebasePlanSyncProviderProps = {
  children: React.ReactNode;
};

export function FirebasePlanSyncProvider({
  children,
}: FirebasePlanSyncProviderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  const setCurrentPlan = usePlanStore((state) => state.setCurrentPlan);
  const setIsPlanSyncReady = usePlanStore((state) => state.setIsPlanSyncReady);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      setIsPlanSyncReady(true);
      return;
    }

    const unsubscribe = subscribeToCurrentPlan(user.uid, {
      onPlanChange: (plan) => {
        setCurrentPlan(plan);
        setIsPlanSyncReady(true);
      },
      onError: (error) => {
        console.error("Plan sync error:", error);
        setIsPlanSyncReady(true);
      },
    });

    return () => unsubscribe();
  }, [user, isAuthReady, setCurrentPlan, setIsPlanSyncReady]);

  return <>{children}</>;
}
