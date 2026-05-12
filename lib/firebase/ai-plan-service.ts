import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { firestoreDb } from "lib/firebase/firebase-client";
import type { DailyPlan, PlanItem } from "types/plan";

type FirestoreDailyPlan = DailyPlan & {
  updatedAt?: unknown;
};

type AiPlanListener = {
  onPlanChange: (plan: DailyPlan | null) => void;
  onError?: (error: Error) => void;
};

function getUserCurrentPlanDoc(userId: string) {
  return doc(firestoreDb, "users", userId, "aiPlans", "current");
}

function mapPlanItem(data: DocumentData): PlanItem {
  return {
    id: String(data.id || ""),
    taskId: String(data.taskId || ""),
    title: String(data.title || "Untitled task"),
    category: data.category || "Personal",
    startTime: String(data.startTime || "10:00"),
    endTime: String(data.endTime || "10:25"),
    durationMinutes: Number(data.durationMinutes || 25),
    method: data.method || "Focus block",
    reason: String(data.reason || "This task fits your current plan."),
    difficulty: data.difficulty || "Medium",
    energyNeeded: data.energyNeeded || "Medium",
  };
}

function mapFirestorePlan(data: DocumentData): DailyPlan {
  const rawItems = Array.isArray(data.items) ? data.items : [];

  return {
    id: String(data.id || "current-plan"),
    title: String(data.title || "Balanced plan"),
    summary: String(
      data.summary || "I kept the plan realistic for your current energy.",
    ),
    importantTasks: Number(data.importantTasks || 0),
    shortBreaks: Number(data.shortBreaks || 0),
    backupTasks: Number(data.backupTasks || 0),
    items: rawItems.map((item) => mapPlanItem(item)),
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
  };
}

export async function saveCurrentPlanToFirestore(
  userId: string,
  plan: DailyPlan,
) {
  const planRef = getUserCurrentPlanDoc(userId);

  const firestorePlan: FirestoreDailyPlan = {
    ...plan,
    updatedAt: serverTimestamp(),
  };

  await setDoc(planRef, firestorePlan, {
    merge: true,
  });
}

export function subscribeToCurrentPlan(
  userId: string,
  listener: AiPlanListener,
): Unsubscribe {
  const planRef = getUserCurrentPlanDoc(userId);

  return onSnapshot(
    planRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        listener.onPlanChange(null);
        return;
      }

      listener.onPlanChange(mapFirestorePlan(snapshot.data()));
    },
    (error) => {
      listener.onError?.(error);
    },
  );
}
