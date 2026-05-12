import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FocusFeedback, FocusSession } from "types/progress";

type AddFocusSessionInput = {
  taskId: string;
  taskTitle: string;
  minutes: number;
  feedback?: FocusFeedback;
};

type ProgressStore = {
  focusSessions: FocusSession[];

  addFocusSession: (input: AddFocusSessionInput) => FocusSession;
  clearProgress: () => void;
};

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `focus-session-${Date.now()}`;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      focusSessions: [],

      addFocusSession: (input) => {
        const session: FocusSession = {
          id: createSessionId(),
          taskId: input.taskId,
          taskTitle: input.taskTitle,
          minutes: input.minutes,
          feedback: input.feedback,
          completedAt: new Date().toISOString(),
        };

        set({
          focusSessions: [session, ...get().focusSessions],
        });

        return session;
      },

      clearProgress: () => {
        set({
          focusSessions: [],
        });
      },
    }),
    {
      name: "mindtask-ai-progress",
    },
  ),
);
