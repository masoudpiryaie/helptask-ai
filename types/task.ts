export type TaskCategory =
  | "Study"
  | "Work"
  | "Home"
  | "Health"
  | "Personal"
  | "Finance"
  | "Errand";

export type TaskStatus =
  | "pending"
  | "scheduled"
  | "started"
  | "done"
  | "skipped";
export type TaskPriority = "Low" | "Normal" | "High" | "Urgent";

export type TaskDifficulty = "Easy" | "Medium" | "Hard";

export type TaskEnergy = "Low" | "Medium" | "High";

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  hasFixedTime: boolean;
  fixedTimeLabel?: string;
  deadlineLabel?: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
  energyNeeded: TaskEnergy;
  priority: TaskPriority;
  aiSuggestion?: string;
  createdAt: string;
};

export type NewTaskInput = {
  title: string;
  category: TaskCategory;
  hasFixedTime: boolean;
  fixedTimeLabel?: string;
  deadlineLabel?: string;
  estimatedMinutes: number;
  difficulty: TaskDifficulty;
  energyNeeded: TaskEnergy;
  priority: TaskPriority;
  aiSuggestion?: string;
};
