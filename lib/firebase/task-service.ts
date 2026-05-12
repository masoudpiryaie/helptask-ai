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

type FirestoreTask = Omit<Task, "createdAt"> & {
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
  };
}

function buildAiSuggestion(input: NewTaskInput) {
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

export async function createTaskInFirestore(
  userId: string,
  input: NewTaskInput,
) {
  const taskId = createTaskId();
  const taskRef = getUserTaskDoc(userId, taskId);

  const task: FirestoreTask = {
    id: taskId,
    title: input.title.trim(),
    category: input.category,
    status: input.hasFixedTime ? "scheduled" : "pending",
    hasFixedTime: input.hasFixedTime,
    fixedTimeLabel: input.fixedTimeLabel,
    deadlineLabel: input.deadlineLabel || "No deadline",
    estimatedMinutes: input.estimatedMinutes,
    difficulty: input.difficulty,
    energyNeeded: input.energyNeeded,
    priority: input.priority,
    aiSuggestion: input.aiSuggestion || buildAiSuggestion(input),
    createdAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  };

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
    fixedTimeLabel: input.hasFixedTime
      ? input.fixedTimeLabel || "Fixed time"
      : null,
    deadlineLabel:
      input.deadlineLabel !== undefined
        ? input.deadlineLabel || "No deadline"
        : undefined,
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
