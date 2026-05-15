import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestoreDb } from "lib/firebase/firebase-client";
import type { NewTaskInput, Task, TaskStatus } from "types/task";

type FirestoreTask = Omit<
  Task,
  | "createdAt"
  | "fixedTimeLabel"
  | "aiSuggestion"
  | "sourceUrl"
  | "recipientEmail"
  | "emailSubject"
  | "emailDraft"
> & {
  fixedTimeLabel?: string | null;
  aiSuggestion?: string | null;
  sourceUrl?: string | null;
  recipientEmail?: string | null;
  emailSubject?: string | null;
  emailDraft?: string | null;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type TaskListener = {
  onTasksChange: (tasks: Task[]) => void;
  onError?: (error: Error) => void;
};

function removeUndefinedFields<T extends Record<string, unknown>>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}`;
}

function getUserTasksCollection(userId: string) {
  return collection(firestoreDb, "users", userId, "tasks");
}

function getUserTaskDoc(userId: string, taskId: string) {
  return doc(firestoreDb, "users", userId, "tasks", taskId);
}

function mapFirestoreTask(docId: string, data: DocumentData): Task {
  return {
    id: docId,
    title: String(data.title || "Untitled task"),
    category: data.category || "Personal",
    status: data.status || "pending",
    hasFixedTime: Boolean(data.hasFixedTime),
    fixedTimeLabel: data.fixedTimeLabel || undefined,
    deadlineLabel: data.deadlineLabel || "No deadline",
    estimatedMinutes: Number(data.estimatedMinutes || 25),
    difficulty: data.difficulty || "Medium",
    energyNeeded: data.energyNeeded || "Medium",
    priority: data.priority || "Normal",
    aiSuggestion: data.aiSuggestion || undefined,
    createdAt:
      typeof data.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),

    source: data.source || "manual",
    externalId: data.externalId || undefined,
    sourceUrl: data.sourceUrl || undefined,

    isEmailTask: Boolean(data.isEmailTask),
    recipientEmail: data.recipientEmail || undefined,
    emailSubject: data.emailSubject || undefined,
    emailDraft: data.emailDraft || undefined,
  };
}

function buildAiSuggestion(input: NewTaskInput) {
  if (input.isEmailTask) {
    return "AI can help you write a calm email draft when you are ready.";
  }

  if (input.category === "Study") {
    return "Try a 25-minute Pomodoro session. Starting is already progress.";
  }

  if (input.difficulty === "Hard") {
    return "Make it easier: start with the smallest possible step.";
  }

  if (input.energyNeeded === "Low") {
    return "This can be a good task for a low-energy moment.";
  }

  if (input.estimatedMinutes <= 10) {
    return "A short sprint can help you finish this without pressure.";
  }

  return "I will help you find a realistic time for this task.";
}

function buildBaseTaskData(taskId: string, input: NewTaskInput): FirestoreTask {
  return {
    id: taskId,
    title: input.title.trim(),
    category: input.category,
    status: input.hasFixedTime ? "scheduled" : "pending",
    hasFixedTime: input.hasFixedTime,
    fixedTimeLabel: input.hasFixedTime
      ? input.fixedTimeLabel || "Fixed time"
      : null,
    deadlineLabel: input.deadlineLabel || "No deadline",
    estimatedMinutes: input.estimatedMinutes,
    difficulty: input.difficulty,
    energyNeeded: input.energyNeeded,
    priority: input.priority,
    aiSuggestion: input.aiSuggestion || buildAiSuggestion(input),
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),

    source: input.source || "manual",
    externalId: input.externalId,
    sourceUrl: input.sourceUrl || null,

    isEmailTask: input.isEmailTask || false,
    recipientEmail: input.recipientEmail || null,
    emailSubject: input.emailSubject || null,
    emailDraft: input.emailDraft || null,
  };
}

export async function createTaskInFirestore(
  userId: string,
  input: NewTaskInput,
) {
  const taskId = createTaskId();
  const taskRef = getUserTaskDoc(userId, taskId);

  const task = buildBaseTaskData(taskId, input);

  await setDoc(taskRef, removeUndefinedFields(task));

  return mapFirestoreTask(taskId, task);
}

export async function updateTaskInFirestore(
  userId: string,
  taskId: string,
  input: Partial<NewTaskInput>,
) {
  const taskRef = getUserTaskDoc(userId, taskId);

  const updateData = removeUndefinedFields({
    ...input,
    title: input.title ? input.title.trim() : undefined,

    fixedTimeLabel:
      input.hasFixedTime === false
        ? null
        : input.fixedTimeLabel !== undefined
          ? input.fixedTimeLabel || "Fixed time"
          : undefined,

    deadlineLabel:
      input.deadlineLabel !== undefined
        ? input.deadlineLabel || "No deadline"
        : undefined,

    sourceUrl:
      input.sourceUrl !== undefined ? input.sourceUrl || null : undefined,

    recipientEmail:
      input.recipientEmail !== undefined
        ? input.recipientEmail || null
        : undefined,

    emailSubject:
      input.emailSubject !== undefined ? input.emailSubject || null : undefined,

    emailDraft:
      input.emailDraft !== undefined ? input.emailDraft || null : undefined,

    updatedAt: serverTimestamp(),
  });

  await updateDoc(taskRef, updateData);
}

export async function updateTaskStatusInFirestore(
  userId: string,
  taskId: string,
  status: TaskStatus,
) {
  const taskRef = getUserTaskDoc(userId, taskId);

  await updateDoc(taskRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTaskFromFirestore(userId: string, taskId: string) {
  const taskRef = getUserTaskDoc(userId, taskId);

  await deleteDoc(taskRef);
}

export function subscribeToUserTasks(
  userId: string,
  listener: TaskListener,
): Unsubscribe {
  const tasksQuery = query(
    getUserTasksCollection(userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    tasksQuery,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const tasks = snapshot.docs.map((taskDoc) =>
        mapFirestoreTask(taskDoc.id, taskDoc.data()),
      );

      listener.onTasksChange(tasks);
    },
    (error) => {
      listener.onError?.(error);
    },
  );
}

export async function upsertCalendarTaskInFirestore(
  userId: string,
  input: NewTaskInput,
) {
  if (!input.externalId) {
    throw new Error("Calendar task needs externalId.");
  }

  const safeExternalId = input.externalId.replaceAll("/", "-");
  const taskId = `google-calendar-${safeExternalId}`;
  const taskRef = getUserTaskDoc(userId, taskId);

  const task: FirestoreTask = {
    id: taskId,
    title: input.title.trim(),
    category: input.category,
    status: "scheduled",
    hasFixedTime: true,
    fixedTimeLabel: input.fixedTimeLabel || "Fixed time",
    deadlineLabel: input.deadlineLabel || "No deadline",
    estimatedMinutes: input.estimatedMinutes,
    difficulty: input.difficulty,
    energyNeeded: input.energyNeeded,
    priority: input.priority,
    aiSuggestion:
      input.aiSuggestion ||
      "Imported from Google Calendar. This time is already fixed.",
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),

    source: "google_calendar",
    externalId: input.externalId,
    sourceUrl: input.sourceUrl || null,

    isEmailTask: false,
    recipientEmail: null,
    emailSubject: null,
    emailDraft: null,
  };

  await setDoc(taskRef, removeUndefinedFields(task), {
    merge: true,
  });

  return mapFirestoreTask(taskId, task);
}

export async function updateEmailDraftInFirestore(
  userId: string,
  taskId: string,
  input: {
    recipientEmail?: string;
    emailSubject?: string;
    emailDraft?: string;
  },
) {
  const taskRef = getUserTaskDoc(userId, taskId);

  const updateData = removeUndefinedFields({
    isEmailTask: true,
    recipientEmail:
      input.recipientEmail !== undefined
        ? input.recipientEmail || null
        : undefined,
    emailSubject:
      input.emailSubject !== undefined ? input.emailSubject || null : undefined,
    emailDraft:
      input.emailDraft !== undefined ? input.emailDraft || null : undefined,
    updatedAt: serverTimestamp(),
  });

  await updateDoc(taskRef, updateData);
}
