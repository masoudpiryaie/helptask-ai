import { create } from "zustand";
import { persist } from "zustand/middleware";

type FocusStore = {
  currentTaskId: string | null;
  sessionMinutes: number;
  isBreak: boolean;

  startFocusTask: (taskId: string, minutes?: number) => void;
  clearFocusTask: () => void;
  setSessionMinutes: (minutes: number) => void;
  setIsBreak: (isBreak: boolean) => void;
};

export const useFocusStore = create<FocusStore>()(
  persist(
    (set) => ({
      currentTaskId: null,
      sessionMinutes: 25,
      isBreak: false,

      startFocusTask: (taskId, minutes = 25) => {
        set({
          currentTaskId: taskId,
          sessionMinutes: minutes,
          isBreak: false,
        });
      },

      clearFocusTask: () => {
        set({
          currentTaskId: null,
          sessionMinutes: 25,
          isBreak: false,
        });
      },

      setSessionMinutes: (minutes) => {
        set({
          sessionMinutes: minutes,
        });
      },

      setIsBreak: (isBreak) => {
        set({
          isBreak,
        });
      },
    }),
    {
      name: "mindtask-ai-focus",
    },
  ),
);
