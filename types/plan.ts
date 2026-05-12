import type { TaskCategory, TaskDifficulty, TaskEnergy } from "types/task";

export type PlanItemMethod =
  | "Pomodoro"
  | "Small step"
  | "10-minute sprint"
  | "Easy start"
  | "Focus block";

export type PlanItem = {
  id: string;
  taskId: string;
  title: string;
  category: TaskCategory;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  method: PlanItemMethod;
  reason: string;
  difficulty: TaskDifficulty;
  energyNeeded: TaskEnergy;
};

export type DailyPlan = {
  id: string;
  title: string;
  summary: string;
  importantTasks: number;
  shortBreaks: number;
  backupTasks: number;
  items: PlanItem[];
  createdAt: string;
};
