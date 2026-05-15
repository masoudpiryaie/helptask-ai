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

export type TaskSource = "manual" | "google_calendar" | "gmail";

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

  source?: TaskSource;
  externalId?: string;
  sourceUrl?: string;
  isEmailTask?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  emailDraft?: string;
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

  source?: TaskSource;
  externalId?: string;
  sourceUrl?: string;
  isEmailTask?: boolean;
  recipientEmail?: string;
  emailSubject?: string;
  emailDraft?: string;
};
