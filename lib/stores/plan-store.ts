import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DailyPlan } from "types/plan";
import type { Task } from "types/task";
import { generateLocalDailyPlan } from "lib/planner/local-ai-planner";

type PlanStore = {
  currentPlan: DailyPlan | null;

  generatePlan: (tasks: Task[]) => DailyPlan;
  clearPlan: () => void;
};

export const usePlanStore = create<PlanStore>()(
  persist(
    (set) => ({
      currentPlan: null,

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
