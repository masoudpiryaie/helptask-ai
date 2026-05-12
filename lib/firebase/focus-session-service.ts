import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestoreDb } from "lib/firebase/firebase-client";
import type { FocusFeedback, FocusSession } from "types/progress";

type AddFocusSessionInput = {
  taskId: string;
  taskTitle: string;
  minutes: number;
  feedback?: FocusFeedback;
};

type FirestoreFocusSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  minutes: number;
  feedback?: FocusFeedback | null;
  completedAt: string;
  createdAt?: unknown;
};

type FocusSessionListener = {
  onFocusSessionsChange: (sessions: FocusSession[]) => void;
  onError?: (error: Error) => void;
};

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `focus-session-${Date.now()}`;
}

function removeUndefinedFields<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function getUserFocusSessionsCollection(userId: string) {
  return collection(firestoreDb, "users", userId, "focusSessions");
}

function getUserFocusSessionDoc(userId: string, sessionId: string) {
  return doc(firestoreDb, "users", userId, "focusSessions", sessionId);
}

function mapFirestoreFocusSession(
  docId: string,
  data: DocumentData,
): FocusSession {
  return {
    id: docId,
    taskId: String(data.taskId || ""),
    taskTitle: String(data.taskTitle || "Focus session"),
    minutes: Number(data.minutes || 0),
    feedback: data.feedback || undefined,
    completedAt:
      typeof data.completedAt === "string"
        ? data.completedAt
        : new Date().toISOString(),
  };
}

export async function createFocusSessionInFirestore(
  userId: string,
  input: AddFocusSessionInput,
) {
  const sessionId = createSessionId();
  const sessionRef = getUserFocusSessionDoc(userId, sessionId);

  const session: FirestoreFocusSession = {
    id: sessionId,
    taskId: input.taskId,
    taskTitle: input.taskTitle,
    minutes: input.minutes,
    feedback: input.feedback || null,
    completedAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  await setDoc(sessionRef, removeUndefinedFields(session));

  return mapFirestoreFocusSession(sessionId, session);
}

export function subscribeToUserFocusSessions(
  userId: string,
  listener: FocusSessionListener,
): Unsubscribe {
  const sessionsQuery = query(
    getUserFocusSessionsCollection(userId),
    orderBy("completedAt", "desc"),
  );

  return onSnapshot(
    sessionsQuery,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const sessions = snapshot.docs.map((sessionDoc) =>
        mapFirestoreFocusSession(sessionDoc.id, sessionDoc.data()),
      );

      listener.onFocusSessionsChange(sessions);
    },
    (error) => {
      listener.onError?.(error);
    },
  );
}
