import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { firestoreDb } from "lib/firebase/firebase-client";
import type { EnergyLevel, Mood } from "types/today";

export type TodayCheckIn = {
  mood: Mood;
  energyLevel: EnergyLevel;
  wakeUpTime: string;
  sleepTime: string;
};

type TodayListener = {
  onTodayChange: (today: TodayCheckIn | null) => void;
  onError?: (error: Error) => void;
};

function getUserTodayDoc(userId: string) {
  return doc(firestoreDb, "users", userId, "today", "main");
}

function mapTodayCheckIn(data: DocumentData): TodayCheckIn {
  return {
    mood: data.mood || "Calm",
    energyLevel: data.energyLevel || "Okay",
    wakeUpTime: data.wakeUpTime || "08:00",
    sleepTime: data.sleepTime || "23:30",
  };
}

export async function saveTodayCheckInToFirestore(
  userId: string,
  input: Partial<TodayCheckIn>,
) {
  const todayRef = getUserTodayDoc(userId);

  await setDoc(
    todayRef,
    {
      ...input,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    },
  );
}

export function subscribeToUserTodayCheckIn(
  userId: string,
  listener: TodayListener,
): Unsubscribe {
  const todayRef = getUserTodayDoc(userId);

  return onSnapshot(
    todayRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        listener.onTodayChange(null);
        return;
      }

      listener.onTodayChange(mapTodayCheckIn(snapshot.data()));
    },
    (error) => {
      listener.onError?.(error);
    },
  );
}
