import type { Task } from "types/task";
import type { EnergyLevel, Mood } from "types/today";

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

function getEnergyMatchScore(task: Task, energyLevel: EnergyLevel) {
  if (energyLevel === "Low") {
    if (task.energyNeeded === "Low") return 3;
    if (task.energyNeeded === "Medium") return 1;
    return -2;
  }

  if (energyLevel === "Okay") {
    if (task.energyNeeded === "Medium") return 3;
    if (task.energyNeeded === "Low") return 2;
    return 1;
  }

  if (energyLevel === "Good") {
    if (task.energyNeeded === "High") return 3;
    if (task.energyNeeded === "Medium") return 2;
    return 1;
  }

  return 0;
}

function getMoodAdjustment(task: Task, mood: Mood) {
  if (mood === "Stressed" || mood === "Tired") {
    if (task.difficulty === "Easy") return 2;
    if (task.estimatedMinutes <= 10) return 2;
    if (task.difficulty === "Hard") return -2;
  }

  if (mood === "Motivated") {
    if (task.priority === "High" || task.priority === "Urgent") return 2;
    if (task.difficulty === "Hard") return 1;
  }

  return 0;
}

export function getNextBestTask(
  tasks: Task[],
  mood: Mood,
  energyLevel: EnergyLevel,
) {
  const availableTasks = tasks.filter(
    (task) => task.status !== "done" && task.status !== "skipped",
  );

  if (availableTasks.length === 0) {
    return null;
  }

  const sortedTasks = [...availableTasks].sort((a, b) => {
    const scoreA =
      priorityScore[a.priority] * 3 +
      getEnergyMatchScore(a, energyLevel) * 2 +
      getMoodAdjustment(a, mood) -
      difficultyScore[a.difficulty];

    const scoreB =
      priorityScore[b.priority] * 3 +
      getEnergyMatchScore(b, energyLevel) * 2 +
      getMoodAdjustment(b, mood) -
      difficultyScore[b.difficulty];

    return scoreB - scoreA;
  });

  return sortedTasks[0];
}

export function getNextBestTaskReason(
  task: Task,
  mood: Mood,
  energyLevel: EnergyLevel,
) {
  if (mood === "Tired" || mood === "Stressed") {
    if (task.estimatedMinutes <= 10) {
      return "This is short, so it can help you get a small win without pressure.";
    }

    if (task.energyNeeded === "Low") {
      return "This task fits your current energy and does not need too much focus.";
    }

    return "I chose a realistic first step so you do not need to push too hard.";
  }

  if (energyLevel === "Good" && task.priority === "High") {
    return "Your energy looks good, and this task is important today.";
  }

  if (task.category === "Study") {
    return "A 25-minute Pomodoro can make this easier to start.";
  }

  if (task.difficulty === "Hard") {
    return "This may feel heavy, so start with only the first small step.";
  }

  return "This is a good task to start now based on your current day.";
}
