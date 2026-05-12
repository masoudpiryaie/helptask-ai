"use client";

import { useEffect } from "react";
import { useAuthStore } from "lib/stores/auth-store";
import { useTodayStore } from "lib/stores/today-store";
import {
  saveTodayCheckInToFirestore,
  subscribeToUserTodayCheckIn,
} from "lib/firebase/today-service";

type FirebaseTodaySyncProviderProps = {
  children: React.ReactNode;
};

export function FirebaseTodaySyncProvider({
  children,
}: FirebaseTodaySyncProviderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  const mood = useTodayStore((state) => state.mood);
  const energyLevel = useTodayStore((state) => state.energyLevel);
  const wakeUpTime = useTodayStore((state) => state.wakeUpTime);
  const sleepTime = useTodayStore((state) => state.sleepTime);

  const setTodayState = useTodayStore((state) => state.setTodayState);
  const setIsTodaySyncReady = useTodayStore(
    (state) => state.setIsTodaySyncReady,
  );

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      setIsTodaySyncReady(true);
      return;
    }

    const unsubscribe = subscribeToUserTodayCheckIn(user.uid, {
      onTodayChange: async (today) => {
        if (!today) {
          await saveTodayCheckInToFirestore(user.uid, {
            mood,
            energyLevel,
            wakeUpTime,
            sleepTime,
          });

          setIsTodaySyncReady(true);
          return;
        }

        setTodayState(today);
        setIsTodaySyncReady(true);
      },
      onError: (error) => {
        console.error("Today sync error:", error);
        setIsTodaySyncReady(true);
      },
    });

    return () => unsubscribe();
  }, [
    user,
    isAuthReady,
    mood,
    energyLevel,
    wakeUpTime,
    sleepTime,
    setTodayState,
    setIsTodaySyncReady,
  ]);

  return <>{children}</>;
}
