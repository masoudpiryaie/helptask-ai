export type FocusFeedback = "Easy" | "Okay" | "Hard" | "Could not focus";

export type FocusSession = {
  id: string;
  taskId: string;
  taskTitle: string;
  minutes: number;
  feedback?: FocusFeedback;
  completedAt: string;
};

export type RewardBadge = {
  id: string;
  title: string;
  description: string;
};
