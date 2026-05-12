import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyPlan } from "types/plan";
import type { Task } from "types/task";
import { generateLocalDailyPlan } from "lib/planner/local-ai-planner";

type PlanStore = {
  currentPlan: DailyPlan | null;
  isPlanSyncReady: boolean;

  setCurrentPlan: (plan: DailyPlan | null) => void;
  setIsPlanSyncReady: (isPlanSyncReady: boolean) => void;

  generatePlan: (tasks: Task[]) => DailyPlan;
  clearPlan: () => void;
};

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      currentPlan: null,
      isPlanSyncReady: false,

      setCurrentPlan: (plan) => {
        set({
          currentPlan: plan,
        });
      },

      setIsPlanSyncReady: (isPlanSyncReady) => {
        set({
          isPlanSyncReady,
        });
      },

      generatePlan: (tasks) => {
        const plan = generateLocalDailyPlan(tasks);

        set({
          currentPlan: plan,
        });

        return plan;
      },

      clearPlan: () => {
        set({
          currentPlan: null,
        });
      },
    }),
    {
      name: "mindtask-ai-plan",
    },
  ),
);
