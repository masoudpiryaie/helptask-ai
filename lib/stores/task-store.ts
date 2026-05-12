import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockTasks } from "data/mock-tasks";
import type { NewTaskInput, Task, TaskStatus } from "types/task";

type TaskStore = {
  tasks: Task[];

  addTask: (input: NewTaskInput) => Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  clearTasks: () => void;
  resetToMockTasks: () => void;
};

function createTaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `task-${Date.now()}`;
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

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,

      addTask: (input) => {
        const newTask: Task = {
          id: createTaskId(),
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
        };

        set({
          tasks: [newTask, ...get().tasks],
        });

        return newTask;
      },

      updateTaskStatus: (taskId, status) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === taskId ? { ...task, status } : task,
          ),
        });
      },

      deleteTask: (taskId) => {
        set({
          tasks: get().tasks.filter((task) => task.id !== taskId),
        });
      },

      clearTasks: () => {
        set({ tasks: [] });
      },

      resetToMockTasks: () => {
        set({ tasks: mockTasks });
      },
    }),
    {
      name: "mindtask-ai-tasks",
    },
  ),
);
