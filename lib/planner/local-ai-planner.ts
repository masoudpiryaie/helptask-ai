import type { Task } from "types/task";
import type { DailyPlan, PlanItem, PlanItemMethod } from "types/plan";

const priorityScore = {
  Urgent: 4,
  High: 3,
  Normal: 2,
  Low: 1,
};

const difficultyScore = {
  Hard: 3,
  Medium: 2,
  Easy: 1,
};

const defaultTimeSlots = ["10:00", "11:30", "15:00", "16:30", "18:00"];

function createPlanId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `plan-${Date.now()}`;
}

function addMinutesToTime(time: string, minutes: number) {
  const [hoursText, minutesText] = time.split(":");
  const date = new Date();

  date.setHours(Number(hoursText));
  date.setMinutes(Number(minutesText) + minutes);
  date.setSeconds(0);

  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${mins}`;
}

function getPlanMethod(task: Task): PlanItemMethod {
  if (task.category === "Study") return "Pomodoro";
  if (task.estimatedMinutes <= 10) return "10-minute sprint";
  if (task.difficulty === "Hard") return "Small step";
  if (task.energyNeeded === "Low") return "Easy start";

  return "Focus block";
}

function getPlanDuration(task: Task) {
  if (task.category === "Study") return 25;
  if (task.estimatedMinutes <= 10) return 10;
  if (task.difficulty === "Hard") return Math.min(task.estimatedMinutes, 30);

  return Math.min(task.estimatedMinutes, 45);
}

function getReason(task: Task) {
  if (task.category === "Study") {
    return "This is a good focus task. A Pomodoro makes it easier to start.";
  }

  if (task.priority === "Urgent") {
    return "This task has high urgency, so I placed it earlier in your plan.";
  }

  if (task.priority === "High") {
    return "This task is important, but the plan keeps it realistic.";
  }

  if (task.difficulty === "Hard") {
    return "This task may feel heavy, so I turned it into a smaller first step.";
  }

  if (task.energyNeeded === "Low") {
    return "This task fits a lower-energy moment.";
  }

  if (task.estimatedMinutes <= 10) {
    return "This is short enough for a quick win.";
  }

  return "This looks like a good flexible task for today.";
}

function sortTasksForPlan(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const priorityDifference =
      priorityScore[b.priority] - priorityScore[a.priority];

    if (priorityDifference !== 0) return priorityDifference;

    const difficultyDifference =
      difficultyScore[b.difficulty] - difficultyScore[a.difficulty];

    if (difficultyDifference !== 0) return difficultyDifference;

    return a.estimatedMinutes - b.estimatedMinutes;
  });
}

export function generateLocalDailyPlan(tasks: Task[]): DailyPlan {
  const flexibleTasks = tasks.filter(
    (task) => !task.hasFixedTime && task.status !== "done",
  );

  const sortedTasks = sortTasksForPlan(flexibleTasks).slice(0, 4);

  const items: PlanItem[] = sortedTasks.map((task, index) => {
    const startTime = defaultTimeSlots[index] || "18:00";
    const durationMinutes = getPlanDuration(task);
    const endTime = addMinutesToTime(startTime, durationMinutes);

    return {
      id: `plan-item-${task.id}`,
      taskId: task.id,
      title: task.title,
      category: task.category,
      startTime,
      endTime,
      durationMinutes,
      method: getPlanMethod(task),
      reason: getReason(task),
      difficulty: task.difficulty,
      energyNeeded: task.energyNeeded,
    };
  });

  return {
    id: createPlanId(),
    title: "Balanced plan",
    summary: "I kept the plan realistic for your current energy.",
    importantTasks: items.filter(
      (item) =>
        tasks.find((task) => task.id === item.taskId)?.priority === "High" ||
        tasks.find((task) => task.id === item.taskId)?.priority === "Urgent",
    ).length,
    shortBreaks: Math.max(items.length - 1, 1),
    backupTasks: flexibleTasks.length > items.length ? 1 : 0,
    items,
    createdAt: new Date().toISOString(),
  };
}
